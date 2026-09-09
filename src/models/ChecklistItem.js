/**
 * Value Object representing a single checklist entry.
 * Immutable identity (id) + mutable inventory quantity.
 */
export class ChecklistItem {
  constructor({ id, title, note = '', quantity, isChecked = false, isCustom = false, createdAt = Date.now() }) {
    this.id = id
    this.title = title
    this.note = note
    // Migrate the former boolean state: checked items become available once.
    this.quantity = quantity === undefined ? (isChecked ? 1 : 0) : Math.max(0, Number(quantity) || 0)
    this.isCustom = isCustom
    this.createdAt = createdAt
  }

  setQuantity(quantity) {
    this.quantity = Math.max(0, Number(quantity) || 0)
    return this
  }

  clone() {
    return new ChecklistItem({ ...this })
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      note: this.note,
      quantity: this.quantity,
      isCustom: this.isCustom,
      createdAt: this.createdAt
    }
  }

  static fromJSON(json) {
    return new ChecklistItem(json)
  }
}
