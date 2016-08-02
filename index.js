'use strict'

let data = require('./data.json')
data = Object.keys(data).map((k) => data[k])



const filterById = (id) => (data) =>
	!!(data && ('object' === typeof data) && data.id === id)

const filterByKeys = (pattern) => (data) => {
	if (!data || 'object' !== typeof data) return false
	for (let key in pattern) {
		if (!data.hasOwnProperty(key)) return false
		if (data[key] !== pattern[key]) return false
	}
	return true
}



const stations = (pattern) => {
	let matcher
	if (pattern === 'all' || pattern === undefined) matcher = () => true
	else if ('object' === typeof pattern) matcher = filterByKeys(pattern)
	else matcher = filterById(pattern)

	return data.filter(matcher)
}

module.exports = Object.assign(stations, {filterById, filterByKeys})
