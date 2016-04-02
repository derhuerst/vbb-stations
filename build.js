'use strict'

const got    = require('got')
const csv    = require('csv-parse')
const ndjson = require('ndjson')
const fs     = require('fs')
const so     = require('so')
const path   = require('path')



const fetchAndReduce = (url, acc, reducer) => new Promise((resolve, reject) => {
	let download = got.stream(url).on('error', reject)
	let parser = csv({columns: true}).on('error', reject)
	download.pipe(parser)
	parser.on('end', () => resolve(acc))
	parser.on('data', (data) => reducer(acc, data))
})

const writeStationsAsNdjson = (path, stations) => new Promise((resolve, reject) => {
	let formatter = ndjson.stringify().on('error', reject)
	let file = fs.createWriteStream(path).on('error', reject)
	formatter.pipe(file)
	file.on('finish', resolve)

	debugger
	for (let id in stations) {
		formatter.write(stations[id])
	}
	formatter.end()
})



const fetchStations = () => fetchAndReduce(
	  'https://raw.githubusercontent.com/derhuerst/vbb-gtfs/master/stops.txt'
	, {} // accumulator
	, (acc, station) => acc[station.stop_id] = {
		  id:        parseInt(station.stop_id)
		, name:      station.stop_name
		, latitude:  parseFloat(station.stop_lat)
		, longitude: parseFloat(station.stop_lon)
		, weight:    0
	}
)

const typeWeights = {
	  100:   1  // regional
	, 102:   1  // regional
	, 109:  .8  // suburban
	, 400:  .7  // subway
	, 700:  .3  // bus
	, 900:  .35 // tram
	, 1000: .6  // ferry
}

const fetchLines = () => fetchAndReduce(
	  'https://raw.githubusercontent.com/derhuerst/vbb-gtfs/master/routes.txt'
	, {} // accumulator
	, (acc, line) => acc[line.route_id] = typeWeights[line.route_type] || .2
)

const fetchTrips = () => fetchAndReduce(
	  'https://raw.githubusercontent.com/derhuerst/vbb-gtfs/master/trips.txt'
	, {} // accumulator
	, (acc, trip) => acc[trip.trip_id] = trip.line_id
)

const stopWeights = {
	  0: 5 // regular stop
	, 2: 1 // call agency
	, 3: 3 // talk to driver
}

const reduceStopWeights = (stations, lines, trips) => fetchAndReduce(
	  'https://raw.githubusercontent.com/derhuerst/vbb-gtfs/master/stop_times.txt'
	, {} // accumulator
	, (acc, stop) => {
		let lineWeight    = lines[trips[stop.trip_id]]      || 1
		let dropOffWeight = stopWeights[stop.drop_off_type] || 0
		let pickupWeight  = stopWeights[stop.pickup_type]   || 0
		stations[stop.stop_id].weight += lineWeight * (dropOffWeight + pickupWeight)
	}
)



const build = so(function* () {
	console.info('Fetching stations.')
	let stations = yield fetchStations()
	console.info('Fetching lines.')
	let lines    = yield fetchLines()
	console.info('Fetching trips.')
	let trips    = yield fetchTrips()
	console.info('Fetching stops.')
	yield reduceStopWeights(stations, lines, trips)

	let file = path.join(__dirname, 'data.ndjson')
	console.info(`Writing stations to ${file}.`)
	yield writeStationsAsNdjson(file, stations)
})

build().catch((err) => {
	console.error(err.stack)
	process.exit(1)
})
