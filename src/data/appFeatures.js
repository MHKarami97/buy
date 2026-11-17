/**
 * Single source of truth for every destination in the app.
 * placement: 'primary' -> bottom navigation, 'more' -> "بیشتر" sheet.
 * The dashboard lists everything except `home`, `lists` (own CTA) and `settings` (header button).
 */
export var TONES = Object.freeze({
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-700/20 dark:text-brand-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-300',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-300',
  fuchsia: 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/20 dark:text-fuchsia-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
})

export var FEATURES = Object.freeze([
  { id: 'home', to: '/', title: 'خانه', desc: 'نمای کلی و دسترسی سریع', icon: 'home', tone: 'brand', placement: 'primary', activePrefixes: [] },
  { id: 'lists', to: '/lists', title: 'لیست‌ها', desc: 'ساخت و مدیریت همه‌ی لیست‌های خرید', icon: 'lists', tone: 'brand', placement: 'primary', activePrefixes: ['/checklist'] },
  { id: 'shopping-list', to: '/shopping-list', title: 'لیست خرید', desc: 'هرچه تمام شده یک‌جا، با قیمت و خروجی PDF', icon: 'cart', tone: 'emerald', placement: 'primary', activePrefixes: [] },
  { id: 'guide', to: '/guide', title: 'راهنمای خرید', desc: 'کالای خوب و مواد برچسب را بشناس', icon: 'book', tone: 'violet', placement: 'primary', activePrefixes: [] },
  { id: 'low-stock', to: '/low-stock', title: 'مواد کم', desc: 'آیتم‌های رو‌به‌اتمام را زودتر ببین', icon: 'alert', tone: 'amber', placement: 'more', activePrefixes: [] },
  { id: 'compare', to: '/compare', title: 'مقایسه کالا', desc: 'دو کالا را کنار هم بسنج', icon: 'scale', tone: 'fuchsia', placement: 'more', activePrefixes: [] },
  { id: 'occasions', to: '/occasions', title: 'خرید مناسبتی', desc: 'لیست ویژه‌ی مهمانی و مناسبت‌ها', icon: 'gift', tone: 'emerald', placement: 'more', activePrefixes: [] },
  { id: 'reports', to: '/reports', title: 'گزارش مصرف', desc: 'هر چند وقت چیزی تمام می‌شود', icon: 'chart', tone: 'sky', placement: 'more', activePrefixes: ['/history'] },
  { id: 'spending', to: '/spending', title: 'هزینه ماهانه', desc: 'خرج هر ماه شمسی را ببین', icon: 'wallet', tone: 'teal', placement: 'more', activePrefixes: [] },
  { id: 'scanner', to: '/scanner', title: 'بارکدخوان', desc: 'اسکن بارکد، QR و تشخیص کشور سازنده', icon: 'scan', tone: 'sky', placement: 'more', activePrefixes: [] }  
])

var HIDDEN_ON_DASHBOARD = new Set(['home', 'lists', 'settings'])

export var PRIMARY_FEATURES = FEATURES.filter((feature) => feature.placement === 'primary')
export var MORE_FEATURES = FEATURES.filter((feature) => feature.placement === 'more')
export var DASHBOARD_FEATURES = FEATURES.filter((feature) => !HIDDEN_ON_DASHBOARD.has(feature.id))

export function isFeatureActive(feature, path) {
  if (feature.to === '/') return path === '/'
  return [feature.to, ...feature.activePrefixes].some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}
