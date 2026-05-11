let {default: rawData} = await import('./data.json', {with: {type: 'json'}})

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

// eslint-disable-next-line no-useless-assignment
rawData = null // allow for gc

export {
	simple as stations,
}
