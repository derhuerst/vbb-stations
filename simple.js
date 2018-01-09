'use strict'

let rawData = require('./data.json')

const simple = []
for (let s of rawData) {
	simple.push({
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

rawData = null // allow for gc
module.exports = simple
