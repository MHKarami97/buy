import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var WHO_NEWS = source('WHO: WHO calls on countries to reduce sugars intake among adults and children', 'https://www.who.int/news/item/04-03-2015-who-calls-on-countries-to-reduce-sugars-intake-among-adults-and-children')
var WHO_GUIDELINE = source('WHO Guideline: Sugars intake for adults and children', 'https://www.ncbi.nlm.nih.gov/books/NBK285525/')
var EFSA_ERYTHRITOL = source('EFSA: Plain language summary, re-evaluation of erythritol (E 968)', 'https://www.efsa.europa.eu/en/plain-language-summary/re-evaluation-erythritol-e-968-food-additive')
var EFSA_SWEETENERS = source('EFSA: Sweeteners and status of re-evaluations', 'https://www.efsa.europa.eu/en/topics/topic/sweeteners')
var BFR_SWEETENERS = source('BfR: Sweeteners in food, selected questions and answers', 'https://www.bfr.bund.de/cm/349/sweeteners-in-food-selected-questions-and-answers.pdf')
var POLYOL_REVIEW = source('Sugar alcohols: their role in the modern world of sweeteners (review)', 'https://link.springer.com/article/10.1007/s00217-015-2437-7')

export var sugarsPolyolsGroup = defineIngredientGroup({
  id: 'sugars-polyols',
  name: 'قندها و الکل‌های قندی',
  icon: '🍭',
  ingredients: [
    defineIngredient({
      id: 'free-sugars',
      name: 'شکر و قندهای افزوده (ساکارز، گلوکز، فروکتوز، شربت)',
      aliases: ['شکر', 'قند', 'گلوکز', 'فروکتوز', 'شربت ذرت', 'شربت گلوکز', 'شربت فروکتوز', 'عسل', 'شیره', 'دکستروز', 'Sugar', 'Glucose', 'Fructose', 'Syrup', 'Free Sugars', 'قند افزوده'],
      whatIsIt: 'WHO «قندهای آزاد» را منوساکاریدها و دی‌ساکاریدهایی می‌داند که تولیدکننده یا مصرف‌کننده اضافه می‌کند، به‌علاوه‌ی قندهای طبیعی عسل، شربت و آب‌میوه‌ی تغلیظ‌شده.',
      role: 'شیرین‌کردن و همچنین حفظ بافت، رنگ و ماندگاری در شیرینی، مربا و نوشیدنی.',
      verdict: Verdict.CAUTION,
      verdictNote: 'WHO توصیه می‌کند قند آزاد کمتر از ۱۰٪ انرژی روزانه باشد و کاهش بیشتر به زیر ۵٪ (حدود ۲۵ گرم) فایده‌ی بیشتری دارد. هر چه شکر یا شربت در ابتدای فهرست مواد بیاید، سهمش در محصول بیشتر است.',
      itemIds: ['sugar', 'jam', 'breakfast-jam', 'honey', 'chocolate', 'chocolate-sauce', 'dry-pastry', 'cereal', 'snacks', 'guest-snacks', 'soft-drink', 'malt-drink', 'syrup', 'hot-chocolate', 'lavashak', 'halva', 'ice-cream', 'cake-powder', 'pancake-powder', 'jelly-powder', 'rock-candy', 'dates', 'sauce'],
      sources: [WHO_NEWS, WHO_GUIDELINE]
    }),
    defineIngredient({
      id: 'polyols',
      name: 'الکل‌های قندی (سوربیتول، مانیتول، مالتیتول، زایلیتول، ایزومالت، لاکتیتول)',
      aliases: ['سوربیتول', 'مانیتول', 'مالتیتول', 'زایلیتول', 'ایزومالت', 'لاکتیتول', 'پلی‌ال', 'E420', 'E421', 'E953', 'E965', 'E966', 'E967', 'Sorbitol', 'Maltitol', 'Xylitol', 'Polyols', 'Sugar Alcohol', 'بدون قند'],
      whatIsIt: 'گروهی از شیرین‌کننده‌های کم‌کالری که شبیه قند هستند ولی کامل جذب نمی‌شوند.',
      role: 'شیرین‌کردن آدامس، شکلات و آب‌نبات بدون قند و حفظ رطوبت بافت.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'برای آن‌ها ADI مشخص نشده و در منابع علمی خطر خاصی گزارش نشده است. مشکل اصلی اثر ملین و نفخ در مصرف زیاد است. در اتحادیه اروپا محصول با بیش از ۱۰٪ پلی‌ال باید عبارت «مصرف بیش از حد ممکن است اثر ملین داشته باشد» را داشته باشد. EFSA بازبینی سوربیتول و زایلیتول را هنوز در جریان اعلام کرده است.',
      itemIds: ['chocolate', 'snacks', 'guest-snacks', 'dry-pastry', 'jelly-powder', 'cereal', 'syrup', 'ice-cream', 'lavashak', 'cake-powder'],
      sources: [POLYOL_REVIEW, BFR_SWEETENERS, EFSA_SWEETENERS]
    }),
    defineIngredient({
      id: 'erythritol',
      name: 'اریتریتول (E968)',
      aliases: ['اریتریتول', 'ارتیریتول', 'E968', 'Erythritol', 'شیرین‌کننده کتو'],
      whatIsIt: 'الکل قندی بسیار کم‌کالری که با تخمیر ساخته می‌شود و تقریباً بدون کالری است.',
      role: 'شیرین‌کننده‌ی محصولات رژیمی، کتو و کم‌قند.',
      verdict: Verdict.CAUTION,
      verdictNote: 'EFSA در بازبینی ۲۰۲۳ ADI را ۰٫۵ گرم بر کیلوگرم وزن بدن در روز تعیین کرد و گفت مصرف برخی افراد از آن بیشتر است. هشدار ملین بودن همچنان معتبر است. در این بازبینی اثر بر قند خون دیده نشد.',
      itemIds: ['chocolate', 'snacks', 'guest-snacks', 'syrup', 'soft-drink', 'jelly-powder', 'ice-cream', 'cereal', 'dry-pastry'],
      sources: [EFSA_ERYTHRITOL]
    })
  ]
})
