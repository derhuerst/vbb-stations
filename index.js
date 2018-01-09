'use strict'

const get = require('lodash.get')

let rawData = require('./data.json')
const data = []
for (let s of rawData) {
	data.push({
		type: 'station',
		id: s[0],
		name: s[1],
		location: {
			type: 'location',
			latitude: s[3],
			longitude: s[4]
		},
		weight: s[2]
	})
}
rawData = null



const filterById = (id) => (data) =>
	!!(data && ('object' === typeof data) && data.id === id)

const filterByKeys = (pattern) => (data) => {
	if (!data || 'object' !== typeof data) return false
	for (let key in pattern) {
		if (get(data, key) !== pattern[key]) return false
	}
	return true
}



const stations = (pattern) => {
	let matcher
	if (pattern === 'all' || pattern === undefined) matcher = () => true
	else if ('object' === typeof pattern) matcher = filterByKeys(pattern)
	else matcher = filterById(pattern) // todo: make this more efficient

	return data.filter(matcher)
}

module.exports = Object.assign(stations, {filterById, filterByKeys})
