'use strict'

const fs = require('fs')
const path = require('path')
const stripBOM = require('strip-bom-stream')
const csv = require('csv-parser')
const mapValues = require('lodash.mapvalues')
const omit = require('lodash.omit')
const shorten = require('vbb-short-station-name')
const parse = require('vbb-parse-line')
const modeWeights = require('vbb-mode-weights')



const newStation = (id) => ({
	type: 'station',
	id,
	name: null,
	location: {
		type: 'location',
		latitude: null,
		longitude: null
	},
	weight: 0,
	stops: []
})

const readCsv = (file) => {
	return fs.createReadStream(path.join(__dirname, file))
	.pipe(stripBOM())
}

const writeJSON = (data, file) => new Promise((yay, nay) => {
	fs.writeFile(path.join(__dirname, '..', file), JSON.stringify(data), (err) => {
		if (err) nay(err)
		else yay()
	})
})



const fetchStations = () => new Promise((yay, nay) => {
	const stations = Object.create(null)
	const stops = Object.create(null)

	readCsv('stops.csv').once('error', nay)
	.pipe(csv()).once('error', nay)

	.on('data', (stop) => {
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
			console.error('Unknown location_type', stop.location_type, 'at', stop.stop_id)
		}
	})

	.on('end', () => yay({stations, stops}))
})



const fetchWeightsOfLines = () => new Promise((yay, nay) => {
	const data = Object.create(null)

	readCsv('routes.csv').on('error', nay)
	.pipe(csv()).on('error', nay)

	.on('data', (line) => {
		let weight = modeWeights[line.route_type] || .2
		const parsed = parse(line.route_short_name)
		if (parsed.type === 'bus' && (parsed.express || parsed.express))
			weight += .05

		const id = line.route_id
		if (!data[id + '']) data[id + ''] = 0
		data[id + ''] += weight
	})

	.on('end', () => yay(data))
})

const fetchLinesOfTrips = () => new Promise((yay, nay) => {
	const data = Object.create(null)

	readCsv('trips.csv').on('error', nay)
	.pipe(csv()).on('error', nay)

	.on('data', (trip) => {
		const id = trip.trip_id
		const lineId = trip.route_id
		data[id + ''] = lineId
	})

	.on('end', () => yay(data))
})

const arrivalWeights = {
	  0: 5 // regular stop
	, 2: 1 // call agency
	, 3: 3 // talk to driver
}

const computeWeights = (stations, stationsByStop, lineWeights, linesByTrip) => new Promise((yay, nay) => {
	readCsv('stop_times.csv').on('error', nay)
	.pipe(csv()).on('error', nay)

	.on('data', (arrival) => {
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
	})

	.on('end', () => yay(stations))
})



Promise.all([
	fetchStations(),
	fetchWeightsOfLines(),
	fetchLinesOfTrips()
])
.then(([{stations, stops}, lineWeights, linesByTrip]) =>
	computeWeights(stations, stops, lineWeights, linesByTrip)
)
.then((full) => {
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

	return Promise.all([
		writeJSON(full, 'full.json'),
		writeJSON(data, 'data.json'),
		writeJSON(names, 'names.json')
	])
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
