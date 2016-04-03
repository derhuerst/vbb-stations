# vbb-stations 🚏

A **collection of all stations of the [Berlin Brandenburg public transport service (VBB)](http://www.vbb.de/)**, computed from [open](http://daten.berlin.de/datensaetze/vbb-fahrplandaten-juni-2015-bis-dezember-2015) [GTFS](https://developers.google.com/transit/gtfs/) [data](https://github.com/derhuerst/vbb-gtfs).

[![npm version](https://img.shields.io/npm/v/vbb-stations.svg)](https://www.npmjs.com/package/vbb-stations)
[![build status](https://img.shields.io/travis/derhuerst/vbb-stations.svg)](https://travis-ci.org/derhuerst/vbb-stations)
[![dependency status](https://img.shields.io/david/derhuerst/vbb-stations.svg)](https://david-dm.org/derhuerst/vbb-stations)
[![dev dependency status](https://img.shields.io/david/dev/derhuerst/vbb-stations.svg)](https://david-dm.org/derhuerst/vbb-stations#info=devDependencies)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-stations.svg)


## Installing

```shell
npm install vbb-stations
```


## Usage

```js
const stations = require('vbb-stations')

stations(true, 9042101).then(console.log) // query a single station
stations({weight: 50}).on('data', console.log) // filter stations
```


## API

`stations([promised], [pattern])`

If `promised` is `true`, a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) will be returned, resolving with an array of results.

Otherwise, a [stream](https://nodejs.org/api/stream.html#stream_class_stream_readable) in [object mode](https://nodejs.org/api/stream.html#stream_object_mode) will be returned, emitting one station at a time.

`pattern` can be one of the following:

- a station ID, like `8000147`
- `'all'`
- an object like `{weight: 50, name: 'Alt Pinnow'}`, with each property being mandatory


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-stations/issues).
