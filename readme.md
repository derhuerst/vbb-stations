# vbb-stations 🚏

A **collection of all stations of the [Berlin Brandenburg public transport service (VBB)](http://www.vbb.de/)**, computed from [open](http://daten.berlin.de/datensaetze/vbb-fahrplandaten-januar-2017-bis-dezember-2017) [GTFS](https://developers.google.com/transit/gtfs/) [data](https://vbb-gtfs.jannisr.de/).

[![npm version](https://img.shields.io/npm/v/vbb-stations.svg)](https://www.npmjs.com/package/vbb-stations)
[![build status](https://img.shields.io/travis/derhuerst/vbb-stations.svg)](https://travis-ci.org/derhuerst/vbb-stations)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-stations.svg)
[![gitter channel](https://badges.gitter.im/derhuerst/vbb-rest.svg)](https://gitter.im/derhuerst/vbb-rest)


## Installing

```shell
npm install vbb-stations
```


## Usage

The [npm package](https://npmjs.com/vbb-stations) contains data in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format).

```js
[
	{
		type: 'station',
		id: '900000009101',
		name: 'U Amrumer Str.',
		coordinates: {
			latitude: 52.542202,
			longitude: 13.349534
		},
		weight: 3563
	}
]
```

You can filter all stations by `id` or any property.

```js
const stations = require('vbb-stations')

console.log(stations('900000009101')) // query a single station
console.log(stations({weight: 50})) // filter by property
```

`full.json` contains all stops of each station and unshortened names.

```js
require('vbb-stations/full.json')['900000009101']
```

`names.json` contains only shortened names.

```js
require('vbb-stations/names.json')['900000009101'] // U Amrumer Str.
```


## API

`stations([pattern])`

`pattern` can be one of the following:

- a station ID, like `900000009101`
- `'all'`
- an object like `{weight: 42, name: 'Alt Pinnow'}`, with each property being mandatory


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-stations/issues).
