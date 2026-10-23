export var SectionKind = Object.freeze({
  CHECK: 'check',
  AVOID: 'avoid',
  LABEL: 'label',
  STORAGE: 'storage',
  TIP: 'tip'
})

var DEFAULT_TITLES = Object.freeze({
  [SectionKind.CHECK]: 'نشانه‌های انتخاب خوب',
  [SectionKind.AVOID]: 'نشانه‌های رد کردن',
  [SectionKind.LABEL]: 'برچسب و مواد تشکیل‌دهنده',
  [SectionKind.STORAGE]: 'نگهداری بعد از خرید',
  [SectionKind.TIP]: 'نکته برای مقایسه'
})

function section(kind, points, title) {
  return { kind: kind, title: title ?? DEFAULT_TITLES[kind], points: points }
}

export function check(points, title) {
  return section(SectionKind.CHECK, points, title)
}

export function avoid(points, title) {
  return section(SectionKind.AVOID, points, title)
}

export function label(points, title) {
  return section(SectionKind.LABEL, points, title)
}

export function storage(points, title) {
  return section(SectionKind.STORAGE, points, title)
}

export function tip(points, title) {
  return section(SectionKind.TIP, points, title)
}

export function source(title, url) {
  return { title: title, url: url }
}

export function defineGuide(definition) {
  return Object.freeze({
    id: definition.id,
    title: definition.title,
    icon: definition.icon,
    itemIds: definition.itemIds ?? [],
    keywords: definition.keywords ?? [],
    excludeKeywords: definition.excludeKeywords ?? [],
    summary: definition.summary,
    sections: definition.sections,
    sources: definition.sources ?? []
  })
}

export function defineGroup(definition) {
  return Object.freeze({
    id: definition.id,
    name: definition.name,
    icon: definition.icon,
    guides: definition.guides
  })
}
