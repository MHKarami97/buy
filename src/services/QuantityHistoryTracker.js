import { ItemHistory } from '../models/ItemHistory.js';
import { QuantityHistoryRepository } from './QuantityHistoryRepository.js';

/**
 * Observer on ChecklistRepository: every time data is persisted it diffs the
 * current item quantities against the last snapshot and appends changes to
 * the history. The store and models stay untouched.
 */
export class QuantityHistoryTracker {
  constructor(options = {}) {
    this.checklists = options.checklists;
    this.histories = options.histories;
    this.clock = options.clock ?? Date.now;
    this.unsubscribe = null;
    this.lastSerialized = null;
    this.isMuted = false;
  }

  start() {
    if (this.unsubscribe) {
      return;
    }
    this.sync();
    this.unsubscribe = this.checklists.onChange(() => this.sync());
  }

  stop() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /** Runs a mutation (e.g. cloud restore) without recording its changes, then re-baselines. */
  runSilently(action) {
    this.isMuted = true;
    try {
      return action();
    } finally {
      this.isMuted = false;
      this.rebaseline();
    }
  }

  rebaseline() {
    this.persistSnapshot(this.collectCurrent().quantities);
  }

  collectCurrent() {
    var quantities = {};
    var meta = {};
    this.checklists.getAll().forEach(function (template) {
      template.categories.forEach(function (category) {
        category.items.forEach(function (item) {
          var key = QuantityHistoryRepository.buildKey(template.id, category.id, item.id);
          quantities[key] = item.quantity;
          meta[key] = {
            title: item.title,
            templateTitle: template.title,
            categoryName: category.name
          };
        });
      });
    });
    return { quantities, meta };
  }

  sync() {
    if (this.isMuted) {
      return;
    }
    var current = this.collectCurrent();
    var snapshot = this.histories.getSnapshot();

    if (snapshot !== null) {
      this.appendChanges(snapshot, current);
    }
    this.persistSnapshot(current.quantities);
  }

  appendChanges(snapshot, current) {
    var now = this.clock();
    var histories = null;

    Object.keys(current.quantities).forEach((key) => {
      var previous = snapshot[key];
      var next = current.quantities[key];
      if (previous === undefined || previous === next) {
        return;
      }
      histories = histories ?? this.histories.getAll();
      var history = histories.get(key) ?? new ItemHistory(key);
      history.updateMeta(current.meta[key]);
      history.record(now, previous, next);
      histories.set(key, history);
    });

    if (histories) {
      this.histories.saveAll(histories);
    }
  }

  persistSnapshot(quantities) {
    var serialized = JSON.stringify(quantities);
    if (serialized === this.lastSerialized) {
      return;
    }
    this.lastSerialized = serialized;
    this.histories.saveSnapshot(quantities);
  }
}
