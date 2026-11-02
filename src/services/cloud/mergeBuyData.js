/**
 * Smart three-way merger for smart-buy templates, categories, items, and shopping notes.
 */
export function mergeBuyData(localData, remoteData) {
  var localTemplates = Array.isArray(localData?.templates) ? localData.templates : []
  var remoteTemplates = Array.isArray(remoteData?.templates) ? remoteData.templates : []

  // 1. ادغام قالب‌ها
  var templateMap = new Map()

  localTemplates.forEach((tpl) => {
    templateMap.set(tpl.id, JSON.parse(JSON.stringify(tpl)))
  })

  remoteTemplates.forEach((remoteTpl) => {
    if (!templateMap.has(remoteTpl.id)) {
      templateMap.set(remoteTpl.id, JSON.parse(JSON.stringify(remoteTpl)))
      return
    }

    var localTpl = templateMap.get(remoteTpl.id)
    var mergedCategories = mergeCategories(localTpl.categories || [], remoteTpl.categories || [])

    templateMap.set(remoteTpl.id, {
      ...localTpl,
      title: remoteTpl.title || localTpl.title,
      icon: remoteTpl.icon || localTpl.icon,
      description: remoteTpl.description || localTpl.description,
      kind: remoteTpl.kind || localTpl.kind,
      version: Math.max(Number(localTpl.version) || 1, Number(remoteTpl.version) || 1),
      sourceDefinitionId: remoteTpl.sourceDefinitionId || localTpl.sourceDefinitionId,
      categories: mergedCategories
    })
  })

  // 2. ادغام شناسه‌های پیش‌فرض حذف‌شده
  var localDeleted = Array.isArray(localData?.deletedDefaultIds) ? localData.deletedDefaultIds : []
  var remoteDeleted = Array.isArray(remoteData?.deletedDefaultIds) ? remoteData.deletedDefaultIds : []
  var mergedDeletedIds = Array.from(new Set([...localDeleted, ...remoteDeleted]))

  // 3. ادغام یادداشت‌های خرید
  var localShoppingNotes = Array.isArray(localData?.shoppingNotes) ? localData.shoppingNotes : []
  var remoteShoppingNotes = Array.isArray(remoteData?.shoppingNotes) ? remoteData.shoppingNotes : []
  var mergedShoppingNotes = mergeNotes(localShoppingNotes, remoteShoppingNotes)

  // 4. ادغام یادداشت‌های مناسبتی
  var localOccasionNotes = Array.isArray(localData?.occasionNotes) ? localData.occasionNotes : []
  var remoteOccasionNotes = Array.isArray(remoteData?.occasionNotes) ? remoteData.occasionNotes : []
  var mergedOccasionNotes = mergeNotes(localOccasionNotes, remoteOccasionNotes)

  return {
    templates: Array.from(templateMap.values()),
    deletedDefaultIds: mergedDeletedIds,
    shoppingNotes: mergedShoppingNotes,
    occasionNotes: mergedOccasionNotes
  }
}

function mergeCategories(localCategories, remoteCategories) {
  var catMap = new Map()

  localCategories.forEach((cat) => {
    catMap.set(cat.id || cat.name, JSON.parse(JSON.stringify(cat)))
  })

  remoteCategories.forEach((remoteCat) => {
    var key = remoteCat.id || remoteCat.name
    if (!catMap.has(key)) {
      catMap.set(key, JSON.parse(JSON.stringify(remoteCat)))
      return
    }

    var localCat = catMap.get(key)
    var mergedItems = mergeItems(localCat.items || [], remoteCat.items || [])

    catMap.set(key, {
      ...localCat,
      name: remoteCat.name || localCat.name,
      icon: remoteCat.icon || localCat.icon,
      items: mergedItems
    })
  })

  return Array.from(catMap.values())
}

function mergeItems(localItems, remoteItems) {
  var itemMap = new Map()

  localItems.forEach((it) => {
    itemMap.set(it.id, JSON.parse(JSON.stringify(it)))
  })

  remoteItems.forEach((remoteIt) => {
    if (!itemMap.has(remoteIt.id)) {
      itemMap.set(remoteIt.id, JSON.parse(JSON.stringify(remoteIt)))
      return
    }

    var localIt = itemMap.get(remoteIt.id)
    var chosenQuantity = Math.max(Number(localIt.quantity) || 0, Number(remoteIt.quantity) || 0)

    itemMap.set(remoteIt.id, {
      ...localIt,
      title: remoteIt.title || localIt.title,
      note: remoteIt.note || localIt.note,
      quantity: chosenQuantity,
      isHidden: Boolean(localIt.isHidden && remoteIt.isHidden),
      isPostponed: Boolean(localIt.isPostponed || remoteIt.isPostponed)
    })
  })

  return Array.from(itemMap.values())
}

function mergeNotes(localNotes, remoteNotes) {
  var noteMap = new Map()

  localNotes.forEach((n) => {
    if (n && n.id) noteMap.set(n.id, JSON.parse(JSON.stringify(n)))
  })

  remoteNotes.forEach((remoteN) => {
    if (!remoteN || !remoteN.id) return
    if (!noteMap.has(remoteN.id)) {
      noteMap.set(remoteN.id, JSON.parse(JSON.stringify(remoteN)))
      return
    }

    var localN = noteMap.get(remoteN.id)
    noteMap.set(remoteN.id, {
      ...localN,
      text: remoteN.text || localN.text,
      isChecked: Boolean(localN.isChecked || remoteN.isChecked),
      createdAt: Math.min(Number(localN.createdAt) || Date.now(), Number(remoteN.createdAt) || Date.now())
    })
  })

  var list = Array.from(noteMap.values())
  list.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
  return list
}
