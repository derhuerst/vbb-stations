stations  = require '.'
full  = require './full.json'



module.exports =

	'filterById': (t) ->
		predicate = stations.filterById 2
		t.expect 6
		t.strictEqual predicate(),          false
		t.strictEqual predicate({}),        false
		t.strictEqual predicate([2]),       false
		t.strictEqual predicate({id:  1 }), false
		t.strictEqual predicate({id: '2'}), false
		t.strictEqual predicate({id:  2 }), true
		t.done()

	'filterByKeys':

		'returns false for invalid data': (t) ->
			predicate = stations.filterByKeys a: 'foo'
			t.expect 3
			t.strictEqual predicate(),    false
			t.strictEqual predicate([2]), false
			t.strictEqual predicate({}),  false
			t.done()

		'compares strictly': (t) ->
			predicate = stations.filterByKeys a: '1'
			t.expect 2
			t.strictEqual predicate({a:  1 }), false
			t.strictEqual predicate({a: '1'}), true
			t.done()

		'compares only *own* properties': (t) ->
			predicate = stations.filterByKeys a: 'foo'
			x = Object.create a: 'foo'
			t.expect 1
			t.strictEqual predicate(x), false
			t.done()

		'compares multiple keys': (t) ->
			predicate = stations.filterByKeys a: 'foo', b: 'bar'
			t.expect 4
			t.strictEqual predicate({a:  'bar', b: 'bar'}), false
			t.strictEqual predicate({a:  'bar', b: 'foo'}), false
			t.strictEqual predicate({a:  'foo', b: 'foo'}), false
			t.strictEqual predicate({a:  'foo', b: 'bar'}), true
			t.done()



	'filters correctly': (t) ->
		t.expect 2
		data = stations id: '900000009101' # U Amrumer Str.
		t.strictEqual data.length, 1
		t.strictEqual data[0].id,  '900000009101'
		t.done()



	'full': (t) ->
		t.expect 7
		data = full['900000009101'] # U Amrumer Str.
		t.strictEqual data.id, '900000009101'
		t.strictEqual data.name.slice(0, 14), 'U Amrumer Str.'
		t.strictEqual data.latitude, 52.542202
		t.strictEqual data.longitude, 13.349534
		t.strictEqual data.weight, 3308
		t.ok Array.isArray data.stops
		t.strictEqual data.stops.length, 7
		t.done()

	'every station in full has an id': (t) ->
		for _, stop of full
			t.ok stop.id, 'missing id at ' + _
		t.done()
