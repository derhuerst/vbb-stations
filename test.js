'use strict'

const test = require('tape')
const isRoughlyEqual = require('is-roughly-equal')

const stations = require('.')
const {filterById, filterByKeys} = stations
const full = require('./full.json')



test('filterById', (t) => {
	t.plan(6)
	const p = filterById(2)

	t.equal(p(), false)
	t.equal(p({}), false)
	t.equal(p([2]), false)
	t.equal(p({id: 1}), false)
	t.equal(p({id: '2'}), false)
	t.equal(p({id: 2}), true)
})

test('filterByKeys', (t) => {
	t.test('returns false for invalid data', (t) => {
		t.plan(3)
		const p = filterByKeys({a: 'foo'})

		t.equal(p(), false)
		t.equal(p([2]), false)
		t.equal(p({}), false)
	})

	t.test('compares strictly', (t) => {
		t.plan(2)
		const p = filterByKeys({a: '1'})

		t.equal(p({a: 1}), false)
		t.equal(p({a: '1'}), true)
	})

	t.test('compares multiple keys', (t) => {
		t.plan(4)
		const p = filterByKeys({a: 'foo', b: 'bar'})

		t.equal(p({a: 'bar', b: 'bar'}), false)
		t.equal(p({a: 'bar', b: 'foo'}), false)
		t.equal(p({a: 'foo', b: 'foo'}), false)
		t.equal(p({a: 'foo', b: 'bar'}), true)
	})

	t.test('compares deeply', (t) => {
		t.plan(2)
		const p = filterByKeys({'a.b': 'foo'})

		t.equal(p({a: {b: 'foo'}}), true)
		t.equal(p({'a.b': 'foo'}), true)
	})
})

test('filters correctly', (t) => {
	t.plan(2)
	const data = stations({
		id: '900000009101', // U Amrumer Str.
		'coordinates.latitude': 52.542202
	})

	t.equal(data.length, 1)
	t.equal(data[0].id,  '900000009101')
})

test('full', (t) => {
	t.plan(9)
	const s = full['900000009101'] // U Amrumer Str.

	t.equal(s.id, '900000009101')
	t.equal(s.name.slice(0, 14), 'U Amrumer Str.')
	t.ok(s.coordinates)
	t.equal(s.coordinates.latitude, 52.542202)
	t.equal(s.coordinates.longitude, 13.349534)
	t.ok(isRoughlyEqual(500, s.weight, 3263))
	t.ok(Array.isArray(s.stops))
	t.equal(s.stops.length, 7)

	t.test('every station has an id', (t) => {
		for (let id in full) {
			const s = full[id]
			t.equal(s.id, id, id + ' has no id')
		}
		t.end()
	})
})
