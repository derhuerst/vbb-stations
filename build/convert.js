'use strict'

const readCsv = require('gtfs-utils/read-csv')
const path = require('path')
const fs = require('fs')
const {
	ENTRANCE_EXIT,
	GENERIC_NODE,
	BOARDING_AREA,
} = require('gtfs-utils/lib/location-types')
const mapValues = require('lodash.mapvalues')
const shorten = require('vbb-short-station-name')
const parse = require('vbb-parse-line')
const modeWeights = require('vbb-mode-weights')

const readFile = name => readCsv(path.join(__dirname, name + '.csv'))

const newStation = (id) => ({
	type: 'station',
	id,
	name: null,
	location: {
		type: 'location',
		latitude: null,
		longitude: null
	},
	weight: 3, // we add a base weight (smoothing)
	stops: []
})

const writeJSON = (data, file) => new Promise((yay, nay) => {
	fs.writeFile(path.join(__dirname, '..', file), JSON.stringify(data), (err) => {
		if (err) nay(err)
		else yay()
	})
})



const fetchStations = async () => {
	const stations = Object.create(null)
	const stops = Object.create(null)

	for await (const stop of await readFile('stops')) {
		if (stop.location_type === ENTRANCE_EXIT) continue
		if (stop.location_type === GENERIC_NODE) continue
		if (stop.location_type === BOARDING_AREA) continue

		// a stop, part of a station
		if (stop.location_type === '0' && stop.parent_station) {
			const id = stop.stop_id
			const stationId = stop.parent_station
			if (!stations[stationId + '']) stations[stationId + ''] = newStation(stationId)
			const station = stations[stationId + '']
			stops[id + ''] = station

			station.stops.push({
				type: 'stop',
				id,
				name: stop.stop_name,
				station: stationId,
				location: {
					type: 'location',
					latitude: parseFloat(stop.stop_lat),
					longitude: parseFloat(stop.stop_lon)
				}
			})
		// a station
		} else if (stop.location_type === '1' || !stop.parent_station) {
			const id = stop.stop_id
			if (!stations[id + '']) stations[id + ''] = newStation(id)
			const station = stations[id + '']

			station.name = stop.stop_name
			station.location = {
				type: 'location',
				latitude: parseFloat(stop.stop_lat),
				longitude: parseFloat(stop.stop_lon)
			}
		} else {
			console.warn('ignoring', stop.stop_id, 'with unknown/invalid location_type', stop.location_type)
		}
	}

	return {
		stations,
		stops,
	}
}



const fetchWeightsOfLines = async () => {
	const data = Object.create(null)

	for await (const line of await readFile('routes')) {
		let weight = modeWeights[line.route_type] || .2
		const parsed = parse(line.route_short_name)
		if (parsed.type === 'bus' && (parsed.express || parsed.express))
			weight += .05

		const id = line.route_id
		if (!data[id + '']) data[id + ''] = 0
		data[id + ''] += weight
	}

	return data
}

const fetchLinesOfTrips = async () => {
	const data = Object.create(null)

	for await (const trip of await readFile('trips')) {
		const id = trip.trip_id
		const lineId = trip.route_id
		data[id + ''] = lineId
	}

	return data
}

const arrivalWeights = {
	0: 5, // regular stop
	2: 1, // call agency
	3: 3, // talk to driver
}

const addWeightsToStations = async (stations, stationsByStop, lineWeights, linesByTrip) => {
	for await (const arrival of await readFile('stop_times')) {
		const station = stations[arrival.stop_id] || stationsByStop[arrival.stop_id]
		if (!station) {
			return console.error([
				'Unknown station/stop', arrival.stop_id,
				'at stop_times.csv arrival with trip ID', arrival.trip_id,
				'sequence #', arrival.stop_sequence
			].join(' '))
		}

		const weight = arrivalWeights[arrival.drop_off_type || '0'] || 0
			+ arrivalWeights[arrival.pickup_type || '0'] || 0
		const lineWeight = lineWeights[linesByTrip[arrival.trip_id]]

		station.weight += lineWeight * weight
	}
}

;(async () => {
	const [
		{stations, stops},
		lineWeights,
		linesByTrip,
	] = await Promise.all([
		fetchStations(),
		fetchWeightsOfLines(),
		fetchLinesOfTrips()
	])

	await addWeightsToStations(stations, stops, lineWeights, linesByTrip)
	const full = stations

	const data = []
	for (let id in full) {
		const s = full[id]
		data.push([
			s.id,
			shorten(s.name),
			s.weight,
			s.location.latitude,
			s.location.longitude
		])
	}

	const names = mapValues(full, (s) => shorten(s.name))

	await Promise.all([
		writeJSON(full, 'full.json'),
		writeJSON(data, 'data.json'),
		writeJSON(names, 'names.json')
	])
})()
.catch((err) => {
	console.error(err)
	process.exit(1)
})
