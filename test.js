import {test} from 'node:test'
import {
	strictEqual,
	ok,
} from 'node:assert/strict'
import isRoughlyEqual from 'is-roughly-equal'
import shorten from 'vbb-short-station-name'

import {stations, filterById, filterByKeys} from './index.js'
import full from './full.json' with {type: 'json'}



test('filterById', (t) => {
	const p = filterById(2)

	strictEqual(p(), false)
	strictEqual(p({}), false)
	strictEqual(p([2]), false)
	strictEqual(p({id: 1}), false)
	strictEqual(p({id: '2'}), false)
	strictEqual(p({id: 2}), true)
})

test('filterByKeys', (t) => {
	t.test('returns false for invalid data', (t) => {
		const p = filterByKeys({a: 'foo'})

		strictEqual(p(), false)
		strictEqual(p([2]), false)
		strictEqual(p({}), false)
	})

	t.test('compares strictly', (t) => {
		const p = filterByKeys({a: '1'})

		strictEqual(p({a: 1}), false)
		strictEqual(p({a: '1'}), true)
	})

	t.test('compares multiple keys', (t) => {
		const p = filterByKeys({a: 'foo', b: 'bar'})

		strictEqual(p({a: 'bar', b: 'bar'}), false)
		strictEqual(p({a: 'bar', b: 'foo'}), false)
		strictEqual(p({a: 'foo', b: 'foo'}), false)
		strictEqual(p({a: 'foo', b: 'bar'}), true)
	})

	t.test('compares deeply', (t) => {
		const p = filterByKeys({'a.b': 'foo'})

		strictEqual(p({a: {b: 'foo'}}), true)
		strictEqual(p({'a.b': 'foo'}), true)
	})
})

test('filters correctly', (t) => {
	const data = stations({
		id: 'de:11000:900009101', // U Amrumer Str.
		'location.latitude': 52.542202
	})

	strictEqual(data.length, 1)
	strictEqual(data[0].id,  'de:11000:900009101')
})

test('contains shortened station names', (t) => {
	const [amrumerStr] = stations('de:11000:900009101') // U Amrumer Str.

	ok(amrumerStr)
	if (amrumerStr) strictEqual(amrumerStr.name, shorten(amrumerStr.name))
})

test('full', (t) => {
	const s = full['de:11000:900009101'] // U Amrumer Str.

	strictEqual(s.type, 'station')
	strictEqual(s.id, 'de:11000:900009101')
	strictEqual(s.name.slice(0, 14), 'U Amrumer Str.')
	ok(s.location)
	strictEqual(s.location.type, 'location')
	strictEqual(s.location.latitude, 52.542202)
	strictEqual(s.location.longitude, 13.349534)
	ok(isRoughlyEqual(2500, s.weight, 4000))
	ok(Array.isArray(s.stops))
	strictEqual(s.stops.length, 2)

	{
		for (let id in full) {
			const s = full[id]
			strictEqual(s.id, id, id + ' has no id')
		}
	}
})
