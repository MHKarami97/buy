var ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
var faNumber = new Intl.NumberFormat('fa-IR', { useGrouping: false })

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, function (char) { return ENTITIES[char] })
}

var STYLES = `
@page { size: A4; margin: 14mm; }
* { box-sizing: border-box; }
body { font-family: 'Vazirmatn', Tahoma, sans-serif; font-size: 12px; line-height: 1.9; color: #0f172a; margin: 0; }
h1 { font-size: 20px; margin: 0 0 2px; }
h2 { font-size: 15px; margin: 18px 0 6px; padding-bottom: 4px; border-bottom: 2px solid #3b6fe0; }
h3 { font-size: 13px; margin: 12px 0 4px; }
.sub { color: #64748b; font-size: 11px; margin: 0 0 8px; }
ul { list-style: none; margin: 0; padding: 0; }
.item { display: flex; align-items: baseline; gap: 8px; padding: 3px 0; border-bottom: 1px dotted #cbd5e1; break-inside: avoid; }
.box { display: inline-block; flex: none; width: 11px; height: 11px; border: 1.5px solid #334155; border-radius: 2px; position: relative; top: 1px; }
.t { font-weight: 600; }
.meta { color: #64748b; font-size: 10.5px; }
.badge { font-size: 10px; padding: 0 6px; border-radius: 9px; background: #fef3c7; color: #92400e; }
.guide, .ingredient { border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; margin: 6px 0; break-inside: avoid; }
.guide p, .ingredient p { margin: 2px 0; }
.kind { font-weight: 700; font-size: 11px; margin-top: 4px; }
.guide li { padding-right: 12px; position: relative; font-size: 11px; }
.guide li::before { content: '•'; position: absolute; right: 0; }
.verdict { font-size: 10px; padding: 0 6px; border-radius: 9px; background: #e2e8f0; }
.verdict.good { background: #d1fae5; color: #065f46; }
.verdict.caution { background: #fef3c7; color: #92400e; }
.verdict.avoid { background: #fee2e2; color: #991b1b; }
.flag { color: #b91c1c; font-weight: 700; }
.appendix { break-before: page; }
.disclaimer { margin-top: 14px; font-size: 10px; color: #64748b; }
@media print { a { color: inherit; text-decoration: none; } }
`

/**
 * Builds a self-contained, print-ready RTL HTML document for a shopping list.
 * Pure (no DOM access) so it can be unit tested; dependencies are injected.
 */
export class ShoppingListDocumentBuilder {
  constructor({ findGuide, ingredientsOfItem, isAvoided = function () { return false }, verdictLabels = {}, fontStylesheetHref = '' }) {
    this.findGuide = findGuide
    this.ingredientsOfItem = ingredientsOfItem
    this.isAvoided = isAvoided
    this.verdictLabels = verdictLabels
    this.fontStylesheetHref = fontStylesheetHref
  }

  build({ title, generatedAtText, groups, options }) {
    var guides = new Map()
    var ingredients = new Map()
    var total = 0

    groups.forEach((group) => {
      group.entries.forEach((entry) => {
        total += 1
        if (options.includeGuides) {
          var guide = this.findGuide(entry.item)
          if (guide) guides.set(guide.id, guide)
        }
        if (options.includeIngredients) {
          this.ingredientsOfItem(entry.item).forEach((ingredient) => ingredients.set(ingredient.id, ingredient))
        }
      })
    })

    var body = [
      `<h1>${escapeHtml(title)}</h1>`,
      `<p class="sub">${escapeHtml(generatedAtText)} · ${faNumber.format(total)} آیتم</p>`,
      groups.map((group) => this.#renderGroup(group, options)).join(''),
      guides.size ? this.#renderGuides(Array.from(guides.values())) : '',
      ingredients.size ? this.#renderIngredients(Array.from(ingredients.values())) : '',
      options.includeGuides || options.includeIngredients
        ? '<p class="disclaimer">توضیحات مواد، خلاصه‌ی منابع تنظیم‌کننده است و توصیه‌ی پزشکی نیست. برای شرایط خاص با پزشک مشورت کنید.</p>'
        : ''
    ].join('')

    var fontLink = this.fontStylesheetHref
      ? `<link rel="stylesheet" href="${escapeHtml(this.fontStylesheetHref)}">`
      : ''
    return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>${fontLink}<style>${STYLES}</style></head><body>${body}</body></html>`
  }

  #renderGroup(group, options) {
    var rows = group.entries
      .map((entry) => {
        var guide = options.includeGuides ? this.findGuide(entry.item) : null
        var low = entry.isLow ? ' <span class="badge">کم</span>' : ''
        var guideNote = guide ? ` · 📖 ${escapeHtml(guide.title)}` : ''
        return `<li class="item"><span class="box"></span><span class="t">${escapeHtml(entry.item.title)}</span>${low}<span class="meta">${escapeHtml(entry.category.name)}${guideNote}</span></li>`
      })
      .join('')
    return `<h2>${escapeHtml(group.template.icon)} ${escapeHtml(group.template.title)} <span class="meta">(${faNumber.format(group.entries.length)})</span></h2><ul>${rows}</ul>`
  }

  #renderGuides(guides) {
    var cards = guides
      .map((guide) => {
        var sections = guide.sections
          .map((section) => `<p class="kind">${escapeHtml(section.title)}</p><ul>${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>`)
          .join('')
        return `<div class="guide"><h3>${escapeHtml(guide.icon)} ${escapeHtml(guide.title)}</h3><p>${escapeHtml(guide.summary)}</p>${sections}</div>`
      })
      .join('')
    return `<div class="appendix"><h2>📖 راهنمای خرید</h2>${cards}</div>`
  }

  #renderIngredients(ingredients) {
    var cards = ingredients
      .map((ingredient) => {
        var flag = this.isAvoided(ingredient.id) ? '<span class="flag">⚠️ در فهرست پرهیز شما</span> ' : ''
        var label = this.verdictLabels[ingredient.verdict] ?? ''
        return `<div class="ingredient"><h3>${flag}${escapeHtml(ingredient.name)} <span class="verdict ${escapeHtml(ingredient.verdict)}">${escapeHtml(label)}</span></h3><p><b>چیست؟</b> ${escapeHtml(ingredient.whatIsIt)}</p><p><b>چه کاری می‌کند؟</b> ${escapeHtml(ingredient.role)}</p><p><b>خوب است یا نه؟</b> ${escapeHtml(ingredient.verdictNote)}</p></div>`
      })
      .join('')
    return `<div class="appendix"><h2>🧪 مواد تشکیل‌دهنده‌ی مرتبط</h2>${cards}</div>`
  }
}
