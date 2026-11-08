import test from 'node:test';
import assert from 'node:assert/strict';
import { ItemHistory } from '../src/models/ItemHistory.js';
import { ConsumptionAnalyzer } from '../src/services/ConsumptionAnalyzer.js';
import { QuantityHistoryTracker } from '../src/services/QuantityHistoryTracker.js';
import { QuantityHistoryRepository } from '../src/services/QuantityHistoryRepository.js';

var DAY = 86400000;
var T0 = Date.UTC(2026, 0, 1);

test('rapid same-direction edits are merged', function () {
  var history = new ItemHistory('k');
  history.record(T0, 0, 0.5);
  history.record(T0 + 1000, 0.5, 1);
  history.record(T0 + 2000, 1, 1.5);
  assert.equal(history.events.length, 1);
  assert.equal(history.events[0].p, 0);
  assert.equal(history.events[0].q, 1.5);
});

test('analyzer computes refill interval and consumption', function () {
  var history = new ItemHistory('k');
  history.record(T0, 0, 4);
  history.record(T0 + 5 * DAY, 4, 0);
  history.record(T0 + 10 * DAY, 0, 4);
  history.record(T0 + 20 * DAY, 4, 0);
  history.record(T0 + 20 * DAY + 3600e3 * 12, 0, 4);
  var stats = ConsumptionAnalyzer.analyze(history, T0 + 25 * DAY, 4);
  assert.equal(stats.restockCount, 3);
  assert.equal(stats.intervals.length, 2);
  assert.ok(Math.abs(stats.intervals[0].days - 10) < 1e-9);
  assert.equal(stats.totalConsumed, 8);
  assert.ok(Math.abs(stats.averageDepletionDays - 7.5) < 1e-9);
  assert.ok(stats.nextRestockAt > T0 + 20 * DAY);
});

test('monthly totals fill gaps', function () {
  var history = new ItemHistory('k');
  history.record(Date.UTC(2026, 2, 25), 0, 2);
  history.record(Date.UTC(2026, 5, 25), 2, 0);
  var months = ConsumptionAnalyzer.monthlyTotals(history);
  assert.ok(months.length >= 3);
  assert.equal(months[0].bought, 2);
  assert.equal(months[months.length - 1].consumed, 2);
});

function fakeStorage() {
  var data = {};
  return {
    get: function (k, fb) { return k in data ? JSON.parse(JSON.stringify(data[k])) : fb; },
    set: function (k, v) { data[k] = JSON.parse(JSON.stringify(v)); return true; }
  };
}

test('tracker records diffs after baseline and ignores first run', function () {
  var quantity = 1;
  var listeners = [];
  var checklists = {
    getAll: function () {
      return [{ id: 't', title: 'T', categories: [{ id: 'c', name: 'C', items: [{ id: 'i', title: 'I', quantity: quantity }] }] }];
    },
    onChange: function (l) { listeners.push(l); return function () {}; }
  };
  var now = T0;
  var repo = new QuantityHistoryRepository(fakeStorage());
  var tracker = new QuantityHistoryTracker({ checklists: checklists, histories: repo, clock: function () { return now; } });
  tracker.start();
  assert.equal(repo.getAll().size, 0);

  quantity = 0; now = T0 + DAY; listeners[0]();
  quantity = 3; now = T0 + 3 * DAY; listeners[0]();
  var history = repo.getByKey('t::c::i');
  assert.equal(history.events.length, 2);
  assert.equal(history.title, 'I');

  tracker.runSilently(function () { quantity = 9; });
  listeners[0]();
  assert.equal(repo.getByKey('t::c::i').events.length, 2);
});

test('mergeRaw de-duplicates events', function () {
  var a = { k: { k: 'k', e: [[1, 0, 1], [2, 1, 0]] } };
  var b = { k: { k: 'k', e: [[2, 1, 0], [3, 0, 2]] } };
  assert.equal(QuantityHistoryRepository.mergeRaw(a, b).k.e.length, 3);
});
