import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var EU_PROPIONATES = source('Commission Regulation (EU) 2016/683 (quotes EFSA conclusion on propionates E 280-283)', 'https://www.legislation.gov.uk/eur/2016/683/contents/data.html')
var EFSA_PROPIONATES = source('EFSA Journal 2014: Re-evaluation of propionic acid and propionates (E 280-283)', 'https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2014.3779')
var EFSA_COLOURS = source('EFSA: Food colours, status of safety assessments', 'https://www.efsa.europa.eu/en/topics/topic/food-colours')
var EFSA_CURCUMIN = source('EFSA: Refined exposure assessment for curcumin (E 100)', 'https://pubmed.ncbi.nlm.nih.gov/42087949/')
var EFSA_COLOURS_NEWS = source('EFSA: Re-evaluation of food colours, major programme completed', 'https://www.efsa.europa.eu/en/press/news/160914-0')

export var propionatesNaturalColorsGroup = defineIngredientGroup({
  id: 'propionates-natural-colors',
  name: 'پروپیونات‌ها و رنگ‌های طبیعی',
  icon: '🧡',
  ingredients: [
    defineIngredient({
      id: 'propionates',
      name: 'پروپیونات‌ها (E280–E283)',
      aliases: ['پروپیونات کلسیم', 'پروپیونات سدیم', 'اسید پروپیونیک', 'نگهدارنده نان', 'E280', 'E281', 'E282', 'E283', 'Calcium Propionate', 'Propionic Acid'],
      whatIsIt: 'اسید پروپیونیک و نمک‌های آن که ضد کپک هستند و در طبیعت هم در پنیر و بدن وجود دارند.',
      role: 'جلوگیری از کپک‌زدگی نان صنعتی، کیک و تورتیلا.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'EFSA در ۲۰۱۴ به این نتیجه رسید که برای ADI داده‌ی کافی نیست، ولی در حداکثر مقدار مجاز مصرف نگرانی ایمنی نیست و ژنوتوکسیسیتی یا سرطان‌زایی هم نگرانی نبود. حد مجاز در اتحادیه اروپا ۱۰۰۰ تا ۳۰۰۰ میلی‌گرم بر کیلوگرم غذاست.',
      itemIds: ['bread', 'toast-bread', 'breakfast-bread', 'pizza-dough', 'cake-powder', 'dry-pastry', 'lasagna', 'biscuits-cookies'],
      sources: [EFSA_PROPIONATES, EU_PROPIONATES]
    }),
    defineIngredient({
      id: 'curcumin',
      name: 'کورکومین (E100)',
      aliases: ['کورکومین', 'زردچوبه', 'رنگ زرد طبیعی', 'E100', 'Curcumin', 'Turmeric'],
      whatIsIt: 'رنگ‌دانه‌ی زرد برگرفته از زردچوبه.',
      role: 'رنگ زرد طبیعی در شیرینی، نوشیدنی، سس و بستنی.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'EFSA در ۲۰۱۰ ADI را ۳ میلی‌گرم بر کیلوگرم وزن بدن تعیین کرد. در ارزیابی تکمیلی ۲۰۱۴ مصرف بزرگسالان زیر ADI بود و در کودکان نزدیک ADI گزارش شد.',
      itemIds: ['sauce', 'ice-cream', 'cake-powder', 'syrup', 'jelly-powder', 'snacks', 'spices', 'dry-pastry', 'noodles', 'chips', 'puffs-snacks', 'soup-powder'],
      sources: [EFSA_CURCUMIN, EFSA_COLOURS]
    }),
    defineIngredient({
      id: 'carmine',
      name: 'کارمین / اسید کارمینیک (E120)',
      aliases: ['کارمین', 'قرمز طبیعی', 'قرمز قرمزدانه', 'E120', 'Carmine', 'Carminic Acid', 'Cochineal'],
      whatIsIt: 'رنگ قرمز که از حشره‌ی قرمزدانه (کوشینیل) گرفته می‌شود و یعنی رنگ با منشأ حیوانی است.',
      role: 'رنگ قرمز و صورتی در ژله، نوشیدنی، سوسیس و شیرینی.',
      verdict: Verdict.CAUTION,
      verdictNote: 'EFSA بازبینی را در ۲۰۱۵ کامل کرد. منشأ حیوانی دارد؛ برای گیاهخواران یا افراد دارای حساسیت باید روی برچسب را بخوانند. جزئیات ADI را در منبع‌های قابل‌اتکا تأیید نکردم.',
      itemIds: ['jelly-powder', 'syrup', 'sausage', 'dry-pastry', 'ice-cream', 'cake-powder', 'lavashak', 'soft-drink', 'gummies-candy'],
      sources: [EFSA_COLOURS]
    }),
    defineIngredient({
      id: 'carotenes-annatto',
      name: 'بتاکاروتن (E160a) و آنوتو (E160b)',
      aliases: ['بتاکاروتن', 'کاروتن', 'آنوتو', 'بیکسین', 'نوربیکسین', 'E160a', 'E160b', 'Beta Carotene', 'Annatto', 'رنگ نارنجی طبیعی'],
      whatIsIt: 'رنگ‌دانه‌های نارنجی؛ بتاکاروتن شبیه رنگ هویج و آنوتو از دانه‌ی گیاه آچیوته (Bixa orellana) است.',
      role: 'رنگ نارنجی و زرد در کره، پنیر، نوشیدنی و مارگارین.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'EFSA بازبینی کاروتن‌ها را در ۲۰۱۲ و آنوتو را در ۲۰۱۶ (با پیگیری ۲۰۱۹) کامل کرده است. برای بتاکاروتن، EFSA بیانیه‌ی جدا درباره‌ی مصرف در سیگاری‌های سنگین دارد. جزئیات عددی نتیجه را در منبع نیافتم.',
      itemIds: ['butter', 'cheese', 'cottage-cheese', 'syrup', 'soft-drink', 'cereal', 'snacks', 'popcorn', 'ice-cream', 'cake-powder', 'cooking-oil', 'puffs-snacks', 'biscuits-cookies'],
      sources: [EFSA_COLOURS, EFSA_COLOURS_NEWS]
    })
  ]
})
