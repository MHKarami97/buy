var MAX_EVENTS = 1000;
var COALESCE_WINDOW_MS = 10 * 60 * 1000;

function round2(value) {
  return Math.round(value * 100) / 100;
}

export class QuantityChange {
  constructor(timestamp, previous, next) {
    this.t = timestamp;
    this.p = previous;
    this.q = next;
  }

  get delta() {
    return round2(this.q - this.p);
  }

  get isRestock() {
    return this.delta > 0;
  }

  get isConsumption() {
    return this.delta < 0;
  }

  toJSON() {
    return [this.t, this.p, this.q];
  }

  static fromJSON(tuple) {
    return new QuantityChange(tuple[0], tuple[1], tuple[2]);
  }
}

/**
 * Append-only change log of one checklist item.
 * Rapid same-direction edits (e.g. pressing +0.5 several times) are merged
 * into one event so a single purchase is not counted as many restocks.
 */
export class ItemHistory {
  constructor(key, meta = {}, events = []) {
    this.key = key;
    this.title = meta.title ?? '';
    this.templateTitle = meta.templateTitle ?? '';
    this.categoryName = meta.categoryName ?? '';
    this.events = events;
  }

  get isEmpty() {
    return this.events.length === 0;
  }

  get lastEvent() {
    return this.events[this.events.length - 1] ?? null;
  }

  updateMeta(meta) {
    this.title = meta.title ?? this.title;
    this.templateTitle = meta.templateTitle ?? this.templateTitle;
    this.categoryName = meta.categoryName ?? this.categoryName;
  }

  record(timestamp, previous, next) {
    var direction = Math.sign(next - previous);
    if (direction === 0) {
      return;
    }
    var last = this.lastEvent;
    var canMerge = last !== null
      && timestamp - last.t <= COALESCE_WINDOW_MS
      && Math.sign(last.delta) === direction
      && last.q === previous;

    if (canMerge) {
      last.q = next;
      last.t = timestamp;
      return;
    }

    this.events.push(new QuantityChange(timestamp, previous, next));
    if (this.events.length > MAX_EVENTS) {
      this.events.shift();
    }
  }

  toJSON() {
    return {
      k: this.key,
      title: this.title,
      tpl: this.templateTitle,
      cat: this.categoryName,
      e: this.events.map(function (event) { return event.toJSON(); })
    };
  }

  static fromJSON(json) {
    var events = (json.e ?? []).map(QuantityChange.fromJSON);
    return new ItemHistory(
      json.k,
      { title: json.title, templateTitle: json.tpl, categoryName: json.cat },
      events
    );
  }
}
