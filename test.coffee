stations  = require './index.js'



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
		data = stations id: 8000147
		t.strictEqual data.length, 1
		t.strictEqual data[0].id,  8000147
		t.done()
