# vbb-stations 🚏

A **collection of all stations of the [Berlin Brandenburg public transport service (VBB)](http://www.vbb.de/)**, computed from [open](http://daten.berlin.de/datensaetze/vbb-fahrplandaten-juni-2015-bis-dezember-2015) [GTFS](https://developers.google.com/transit/gtfs/) [data](https://github.com/derhuerst/vbb-gtfs).

[![npm version](https://img.shields.io/npm/v/vbb-stations.svg)](https://www.npmjs.com/package/vbb-stations)
[![build status](https://img.shields.io/travis/derhuerst/vbb-stations.svg)](https://travis-ci.org/derhuerst/vbb-stations)
[![dependency status](https://img.shields.io/david/derhuerst/vbb-stations.svg)](https://david-dm.org/derhuerst/vbb-stations)
[![dev dependency status](https://img.shields.io/david/dev/derhuerst/vbb-stations.svg)](https://david-dm.org/derhuerst/vbb-stations#info=devDependencies)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-stations.svg)
[![gitter channel](https://badges.gitter.im/derhuerst/vbb-rest.svg)](https://gitter.im/derhuerst/vbb-rest)


## Installing

```shell
npm install vbb-stations
```


## Usage

```js
const stations = require('vbb-stations')

console.log(stations(9042101)) // query a single station
console.log(stations({weight: 50})) // filter by property
```


## API

`stations([pattern])`

`pattern` can be one of the following:

- a station ID, like `8000147`
- `'all'`
- an object like `{weight: 50, name: 'Alt Pinnow'}`, with each property being mandatory


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-stations/issues).
