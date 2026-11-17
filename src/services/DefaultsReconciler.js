import { ChecklistFactory } from './ChecklistFactory'

/**
 * DefaultsReconciler
 * ------------------
 * Strategy Pattern: encapsulates the algorithm that merges an updated
 * default definition (shipped in source code) into an already-persisted
 * user template, without touching the user's progress or custom items.
 *
 * Contract for defaultChecklistDefinitions entries (required for stable
 * matching across app updates):
 *   { id: 'travel', version: 2, categories: [
 *       { id: 'documents', name: 'Documents', icon: '📄', items: [
 *           { id: 'passport', title: 'Passport', note: '' }
 *       ]}
 *   ]}
 *
 * When does a template get reconciled (additive merge)?
 *  - when the definition `version` is higher than the template's, OR
 *  - when the definition's *signature* (the ids of its categories and items)
 *    differs from the signature that was applied last time. The signature
 *    makes the merge automatic: adding an item to a definition no longer
 *    depends on remembering to bump `version`.
 *
 * Rules of the additive merge (by design, to avoid destroying user data):
 *  1. A category present in the definition but missing from the template
 *     (matched by id) is appended as-is.
 *  2. An item present in a matched category's definition but missing from
 *     the template's category (matched by id) is appended, unchecked.
 *  3. Existing categories/items are never removed here. Deletions upstream
 *     are intentionally ignored to avoid wiping user progress silently.
 *  4. The template's `version` is bumped to the definition's version only
 *     after a successful merge pass, so re-running is idempotent.
 *
 * Label sync (runs on every start, idempotent, never adds or removes anything):
 *  - template title/description/icon, category name/icon and item title/note
 *    follow the definition. Items the user created (`isCustom`) are never
 *    touched; default items cannot be renamed from the UI, so the source
 *    code is the single source of truth for their names.
 */
export class DefaultsReconciler {
  /**
   * Stable fingerprint of the structure (ids only) of a definition.
   * @param {object} definition
   * @returns {string}
   */
  static signatureOf(definition) {
    var parts = []
    ;(definition?.categories ?? []).forEach((category) => {
      parts.push(`#${category.id}`)
      ;(category.items ?? []).forEach((item) => parts.push(`${category.id}/${item.id}`))
    })
    var text = parts.join('|')
    var hash = 5381
    for (var index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) + hash + text.charCodeAt(index)) | 0
    }
    return `${parts.length}:${(hash >>> 0).toString(36)}`
  }

  /**
   * @param {ChecklistTemplate} template - persisted template instance
   * @param {object} definition - current definition from source code
   * @param {{ force?: boolean }} [options] - force a merge even if versions match
   * @returns {boolean} true if the template was mutated
   */
  static reconcile(template, definition, options = {}) {
    if (!template || !definition) return false
    var isOutdated = (template.version ?? 0) < (definition.version ?? 0)
    if (!isOutdated && !options.force) return false

    var mutated = false

    definition.categories.forEach((defCategory) => {
      var category = template.findCategory(defCategory.id)

      if (!category) {
        template.categories.push(ChecklistFactory.createCategoryFromDefinition(defCategory))
        mutated = true
        return
      }

      defCategory.items.forEach((defItem) => {
        var existingItem = category.findItem(defItem.id)
        if (!existingItem) {
          category.addItem(ChecklistFactory.createItemFromDefinition(defItem))
          mutated = true
        }
      })
    })

    if (isOutdated) template.version = definition.version
    return mutated
  }

  /**
   * Copies display text (names, notes, icons) from the definition onto the
   * persisted template, matching categories and items by id. Quantities,
   * visibility and every other user state are left untouched.
   *
   * @param {ChecklistTemplate} template
   * @param {object} definition
   * @returns {boolean} true if anything was updated
   */
  static syncLabels(template, definition) {
    if (!template || !definition) return false
    var mutated = false

    var assign = function (target, key, value) {
      if (value === undefined || target[key] === value) return
      target[key] = value
      mutated = true
    }

    assign(template, 'title', definition.title)
    assign(template, 'description', definition.description)
    assign(template, 'icon', definition.icon)

    definition.categories.forEach((defCategory) => {
      var category = template.findCategory(defCategory.id)
      if (!category) return
      assign(category, 'name', defCategory.name)
      assign(category, 'icon', defCategory.icon)

      defCategory.items.forEach((defItem) => {
        var item = category.findItem(defItem.id)
        if (!item || item.isCustom) return
        assign(item, 'title', defItem.title)
        assign(item, 'note', defItem.note ?? '')
      })
    })

    return mutated
  }

  /**
   * Runs reconciliation for every known default definition against the
   * currently loaded templates. Adds brand-new default templates (ones the
   * user never had) unless the user explicitly deleted them before.
   *
   * @param {ChecklistTemplate[]} templates
   * @param {object[]} definitions
   * @param {string[]} deletedDefaultIds
   * @param {Record<string, string>} appliedSignatures - signatures applied on previous runs
   * @returns {{ templates: ChecklistTemplate[], changed: boolean, signatures: Record<string, string> }}
   */
  static reconcileAll(templates, definitions, deletedDefaultIds = [], appliedSignatures = {}) {
    var changed = false
    var result = [...templates]
    var signatures = { ...appliedSignatures }

    definitions.forEach((definition) => {
      var signature = this.signatureOf(definition)
      var existing = result.find((tpl) => tpl.sourceDefinitionId === definition.id)

      if (existing) {
        var isStale = appliedSignatures[definition.id] !== signature
        if (this.reconcile(existing, definition, { force: isStale })) changed = true
        if (this.syncLabels(existing, definition)) changed = true
        signatures[definition.id] = signature
        return
      }

      if (deletedDefaultIds.includes(definition.id)) return

      result.push(ChecklistFactory.createFromDefinition(definition))
      signatures[definition.id] = signature
      changed = true
    })

    return { templates: result, changed: changed, signatures: signatures }
  }
}
