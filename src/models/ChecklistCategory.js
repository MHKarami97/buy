import { ChecklistItem } from './ChecklistItem'

export class ChecklistCategory {
  constructor({ id, name, icon = '📌', items = [] }) {
    this.id = id
    this.name = name
    this.icon = icon
    this.items = items.map((item) => (item instanceof ChecklistItem ? item : new ChecklistItem(item)))
  }

  get activeItems() {
    return this.items.filter((item) => !item.isHidden)
  }

  get totalCount() {
    return this.activeItems.length
  }

  get completedCount() {
    return this.activeItems.filter((item) => item.quantity > 0).length
  }

  get progressPercent() {
    if (this.totalCount === 0) return 0
    return Math.round((this.completedCount / this.totalCount) * 100)
  }

  addItem(item) {
    this.items.push(item instanceof ChecklistItem ? item : new ChecklistItem(item))
  }

  removeItem(itemId) {
    this.items = this.items.filter((item) => item.id !== itemId)
  }

  findItem(itemId) {
    return this.items.find((item) => item.id === itemId)
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      items: this.items.map((item) => item.toJSON())
    }
  }

  static fromJSON(json) {
    return new ChecklistCategory(json)
  }
}