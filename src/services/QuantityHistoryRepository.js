import { ItemHistory } from '../models/ItemHistory.js';
import { storageService } from './StorageService.js';

var HISTORY_KEY = 'quantity-history';
var SNAPSHOT_KEY = 'quantity-snapshot';

/** Repository Pattern: persistence of per-item quantity history. */
export class QuantityHistoryRepository {
  constructor(storage = storageService) {
    this.storage = storage;
  }

  static buildKey(templateId, categoryId, itemId) {
    return templateId + '::' + categoryId + '::' + itemId;
  }

  getAll() {
    var raw = this.storage.get(HISTORY_KEY, {});
    var entries = Object.keys(raw).map(function (key) {
      return [key, ItemHistory.fromJSON(raw[key])];
    });
    return new Map(entries);
  }

  getByKey(key) {
    var raw = this.storage.get(HISTORY_KEY, {});
    return raw[key] ? ItemHistory.fromJSON(raw[key]) : null;
  }

  saveAll(histories) {
    var payload = {};
    histories.forEach(function (history, key) {
      if (!history.isEmpty) {
        payload[key] = history.toJSON();
      }
    });
    return this.storage.set(HISTORY_KEY, payload);
  }

  remove(key) {
    var histories = this.getAll();
    histories.delete(key);
    return this.saveAll(histories);
  }

  getSnapshot() {
    return this.storage.get(SNAPSHOT_KEY, null);
  }

  saveSnapshot(snapshot) {
    return this.storage.set(SNAPSHOT_KEY, snapshot);
  }

  exportRaw() {
    return this.storage.get(HISTORY_KEY, {});
  }

  importRaw(raw) {
    return this.storage.set(HISTORY_KEY, raw ?? {});
  }

  /** Union of two raw exports; events are de-duplicated by (t, p, q). */
  static mergeRaw(local = {}, remote = {}) {
    var result = Object.assign({}, local);
    Object.keys(remote).forEach(function (key) {
      var mine = result[key];
      if (!mine) {
        result[key] = remote[key];
        return;
      }
      var seen = new Set(mine.e.map(function (tuple) { return tuple.join('|'); }));
      var extra = remote[key].e.filter(function (tuple) { return !seen.has(tuple.join('|')); });
      var events = mine.e.concat(extra).sort(function (a, b) { return a[0] - b[0]; });
      result[key] = Object.assign({}, mine, { e: events });
    });
    return result;
  }
}

export const quantityHistoryRepository = new QuantityHistoryRepository();
