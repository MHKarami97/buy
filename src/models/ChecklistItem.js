export class ChecklistItem {
  constructor({ id, title, note = '', quantity, isChecked = false, isCustom = false, createdAt = Date.now(), isHidden = false }) {
    this.id = id
    this.title = title
    this.note = note
    this.quantity = ChecklistItem.normalizeQuantity(quantity === undefined ? (isChecked ? 1 : 0) : quantity)
    this.isCustom = isCustom
    this.createdAt = createdAt
    this.isHidden = isHidden
  }

  setQuantity(quantity) {
    this.quantity = ChecklistItem.normalizeQuantity(quantity)
    return this
  }

  static normalizeQuantity(quantity) {
    const numericQuantity = Math.max(0, Number(quantity) || 0)
    return Math.round(numericQuantity * 2) / 2
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
      createdAt: this.createdAt,
      isHidden: this.isHidden
    }
  }

  static fromJSON(json) {
    return new ChecklistItem(json)
  }
}