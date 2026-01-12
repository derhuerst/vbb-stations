# vbb-stations 🚏

A **collection of all stations of the [Berlin Brandenburg public transport service (VBB)](http://www.vbb.de/)**, computed from [open](https://daten.berlin.de/datensaetze/vbb-fahrplandaten-gtfs) [GTFS](https://gtfs.org/documentation/schedule/reference/) [data](https://vbb-gtfs.jannisr.de/).

[![npm version](https://img.shields.io/npm/v/vbb-stations.svg)](https://www.npmjs.com/package/vbb-stations)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-stations.svg)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me via Matrix](https://img.shields.io/badge/chat%20with%20me-via%20Matrix-000000.svg)](https://matrix.to/#/@derhuerst:matrix.org)


## Installing

```shell
npm install vbb-stations
```


## Usage

The [npm package](https://npmjs.com/vbb-stations) contains [*Friendly Public Transport Format* 1.2.1](https://github.com/public-transport/friendly-public-transport-format/blob/1.2.1/spec/readme.md) `station`s and `stop`s. `weight` is the sum of all arrivals & departures at a station, weighted by mode of transport.

```js
[
	{
		type: 'station',
		id: 'de:11000:900009101',
		name: 'U Amrumer Str.',
		location: {
			type: 'location',
			latitude: 52.542202,
			longitude: 13.349534
		},
		weight: 2474,
	}
]
```

You can filter all stations by `id` or any property ([`lodash.get`](https://lodash.com/docs/#get) will be used).

```js
const stations = require('vbb-stations')

console.log(stations('de:11000:900009101')) // query a single station
console.log(stations({ // filter by property
	weight: 2474,
	'location.latitude': 52.542202
}))
```

`full.json` contains all stops of each station and unshortened names.

```js
require('vbb-stations/full.json')['de:11000:900009101']
```

One entry looks like this:

```js
{
	type: 'station',
	id: 'de:11000:900009101',
	name: 'U Amrumer Str. (Berlin)',
	location: {
		type: 'location',
		latitude: 52.542202,
		longitude: 13.349534
	},
	weight: 2474,
	stops: [
		{
			type: 'stop',
			id: 'de:11000:900009101::1',
			name: 'U Amrumer Str. (Berlin)',
			station: 'de:11000:900009101',
			location: {
				type: 'location',
				latitude: 52.542202,
				longitude: 13.349534
			}
		},
		// …
		{
			type: 'stop',
			id: 'de:11000:900009101::2',
			name: 'U Amrumer Str. (Berlin)',
			station: 'de:11000:900009101',
			location: {
				type: 'location',
				latitude: 52.542202,
				longitude: 13.349534
			}
		}
	]
}
```

`names.json` contains only shortened names.

```js
require('vbb-stations/names.json')['de:11000:900009101'] // U Amrumer Str.
```


## API

`stations([pattern])`

`pattern` can be one of the following:

- a station ID, like `de:11000:900009101`
- `'all'`
- an object like `{weight: 42, name: 'Alt Pinnow'}`, with each property being mandatory


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-stations/issues).
