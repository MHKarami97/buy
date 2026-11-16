import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var FDA_CBS = source('FDA GRAS Notice 654: Cocoa butter substitute', 'https://www.fda.gov/files/food/published/GRAS-Notice-000654---Cocoa-butter-substitute.pdf')
var JRC_CBE = source('EU Joint Research Centre: Foreign fats in chocolate', 'https://joint-research-centre.ec.europa.eu/scientific-activities/food-authenticity-and-quality/foreign-fats-chocolate_en')
var MAYO_TRANS = source('Mayo Clinic: Trans fat is double trouble for heart health', 'https://www.mayoclinic.org/diseases-conditions/high-blood-cholesterol/in-depth/trans-fat/art-20046114')

var CHOCOLATE_ITEMS = ['chocolate', 'chocolate-sauce', 'hot-chocolate', 'cocoa', 'dry-pastry', 'snacks', 'guest-snacks', 'cereal', 'ice-cream']

export var fatsCocoaGroup = defineIngredientGroup({
  id: 'fats-cocoa',
  name: 'چربی‌ها و جانشین‌های کاکائو',
  icon: '🍫',
  ingredients: [
    defineIngredient({
      id: 'cocoa-butter-substitute',
      name: 'جانشین کره کاکائو (CBS / CBR)',
      aliases: ['جانشین کاکائو', 'جایگزین کره کاکائو', 'CBS', 'CBR', 'Cocoa Butter Substitute', 'Cocoa Butter Replacer', 'چربی لوریک', 'روغن پالم‌کرنل'],
      whatIsIt: 'چربی گیاهی ارزان‌تر که به‌جای کره کاکائو در روکش و شکلات‌های «کاکائویی» به کار می‌رود. CBS معمولاً بر پایه چربی‌های لوریک (مثل پالم‌کرنل و نارگیل) و CBR از چربی‌های غیرلوریک ساخته می‌شود.',
      role: 'ارزان‌تر کردن محصول، سریع‌تر سفت شدن روکش و بدون نیاز به تمپر. در مقابل، با کره کاکائو سازگاری محدودی دارد.',
      verdict: Verdict.CAUTION,
      verdictNote: 'خطر حاد ندارد، اما یعنی طعم و ارزش شکلات واقعی کمتر است. در اتحادیه اروپا فقط تا ۵٪ چربی گیاهی دیگر مجاز است و بیشتر از آن باید «روکش/کامپاند» نامیده شود. اگر شکلات واقعی می‌خواهید، فهرست باید کره کاکائو را بدون این چربی‌ها نشان دهد. چربی‌های لوریک پرچرب‌اشباع‌اند، پس مصرفشان را محدود کنید.',
      itemIds: CHOCOLATE_ITEMS,
      sources: [FDA_CBS, JRC_CBE]
    }),
    defineIngredient({
      id: 'cocoa-butter-equivalent',
      name: 'معادل کره کاکائو (CBE)',
      aliases: ['CBE', 'Cocoa Butter Equivalent', 'معادل کاکائو', 'چربی گیاهی غیر از کره کاکائو', 'شی‌باتر', 'روغن شیا'],
      whatIsIt: 'چربی گیاهی که ساختار تری‌گلیسریدی و رفتار ذوبش شبیه کره کاکائو است و با آن در هر نسبتی سازگار می‌ماند.',
      role: 'جایگزینی بخش کوچکی از کره کاکائو بدون تغییر محسوس در بافت.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'طبق دستورالعمل شکلات اروپا تا ۵٪ مجاز و باید روی برچسب ذکر شود. از نظر ایمنی نگرانی خاصی ندارد؛ فقط ارزش شکلات خالص را کم می‌کند.',
      itemIds: CHOCOLATE_ITEMS,
      sources: [JRC_CBE, FDA_CBS]
    }),
    defineIngredient({
      id: 'partially-hydrogenated-oil',
      name: 'روغن هیدروژنه یا نیمه‌هیدروژنه',
      aliases: ['روغن هیدروژنه', 'روغن نیمه هیدروژنه', 'چربی ترانس', 'Partially Hydrogenated Oil', 'Trans Fat', 'شورتنینگ', 'مارگارین'],
      whatIsIt: 'روغن مایعی که با فرایند هیدروژناسیون جامد یا نیمه‌جامد شده است. هیدروژناسیون جزئی می‌تواند چربی ترانس بسازد.',
      role: 'ماندگاری بیشتر، بافت ترد یا نرم و ارزانی در شیرینی، سرخ‌کردنی و غذای آماده.',
      verdict: Verdict.AVOID,
      verdictNote: 'چربی ترانس صنعتی کلسترول LDL را بالا و HDL را پایین می‌آورد و خطر بیماری قلبی را افزایش می‌دهد. محصولی با این عبارت در فهرست مواد را با نمونه بدون آن مقایسه کنید.',
      itemIds: ['cooking-oil', 'cooking-oil-rice', 'fried-onions', 'snacks', 'dry-pastry', 'popcorn', 'chocolate', 'frozen-fries', 'nuggets', 'cake-powder', 'cereal', 'butter'],
      sources: [MAYO_TRANS]
    }),
    defineIngredient({
      id: 'mono-diglycerides',
      name: 'مونو و دی‌گلیسرید اسیدهای چرب (امولسیفایر)',
      aliases: ['مونوگلیسرید', 'دی‌گلیسرید', 'امولسیفایر', 'E471', 'Mono and Diglycerides', 'Emulsifier'],
      whatIsIt: 'ماده امولسیفایر که آب و چربی را در محصول یکنواخت نگه می‌دارد. طبق سند FDA، مونوگلیسریدها رایج‌ترین امولسیفایر صنعت غذا هستند (حدود ۷۰٪ مصرف امولسیفایرها).',
      role: 'نرمی نان و کیک، جلوگیری از جدا شدن چربی در بستنی و شکلات و پایداری سس‌ها.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'در مصرف عادی غذایی نگرانی خاصی گزارش نشده است. نشانه کم‌ارزش بودن محصول نیست، اما خود محصول را با فهرست مواد کوتاه‌تر مقایسه کنید. سند FDA فقط رایج بودن را تأیید می‌کند و ارزیابی ایمنی جداگانه‌ای در آن نبود.',
      itemIds: ['chocolate', 'ice-cream', 'cake-powder', 'toast-bread', 'breakfast-bread', 'mayonnaise-sauce', 'cream', 'snacks', 'dry-pastry'],
      sources: [FDA_CBS]
    })
  ]
})
