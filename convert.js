'use strict'

const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const mapValues = require('lodash.mapvalues')
const omit = require('lodash.omit')
const shorten = require('vbb-short-station-name')
const parse = require('vbb-parse-line')



const newStation = (id) => ({
	type: 'station',
	id,
	name: null,
	coordinates: {
		latitude: null,
		longitude: null
	},
	weight: 0,
	stops: []
})

const writeJSON = (data, file) => new Promise((yay, nay) => {
	fs.writeFile(path.join(__dirname, file), JSON.stringify(data), (err) => {
		if (err) nay(err)
		else yay()
	})
})



const fetchStations = () => new Promise((yay, nay) => {
	const stations = {}
	const stops = {}

	fs.createReadStream(path.join(__dirname, 'stops.txt')).on('error', nay)
	.pipe(csv()).on('error', nay)

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
				coordinates: {
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
			station.coordinates = {
				latitude: parseFloat(stop.stop_lat),
				longitude: parseFloat(stop.stop_lon)
			}
		} else console.error('Unknown location_type', stop.location_type, 'at', stop.stop_id)
	})

	.on('end', () => yay({stations, stops}))
})



const modeWeights = {
	  100:   1  // regional
	, 102:   1  // regional
	, 109:  .8  // suburban
	, 400:  .7  // subway
	, 700:  .25 // bus
	, 3:    .25 // bus
	, 900:  .35 // tram
	, 1000: .6  // ferry
}

const fetchWeightsOfLines = () => new Promise((yay, nay) => {
	const data = {}

	fs.createReadStream(path.join(__dirname, 'routes.txt')).on('error', nay)
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
	const data = {}

	fs.createReadStream(path.join(__dirname, 'trips.txt')).on('error', nay)
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
	fs.createReadStream(path.join(__dirname, 'stop_times.txt')).on('error', nay)
	.pipe(csv()).on('error', nay)

	.on('data', (arrival) => {
		const station = stations[arrival.stop_id] || stationsByStop[arrival.stop_id]
		if (!station) return console.error('Unknown station', arrival.stop_id)

		const weight = arrivalWeights[arrival.drop_off_type] || 0
			+ arrivalWeights[arrival.pickup_type] || 0
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
	const data = mapValues(full, (s) => {
		s = omit(s, ['stops'])
		s.name = shorten(s.name)
		return s
	})

	return Promise.all([
		writeJSON(full, 'full.json'),
		writeJSON(data, 'data.json')
	])
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
