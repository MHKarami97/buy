import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var EFSA_E171 = source('EFSA: E171 no longer considered safe when used as a food additive', 'https://www.efsa.europa.eu/en/news/titanium-dioxide-e171-no-longer-considered-safe-when-used-food-additive')
var EC_REEVAL = source('European Commission: Re-evaluation of food additives (Regulation 2022/63 withdrawing E171)', 'https://food.ec.europa.eu/food-safety/food-improvement-agents/additives/re-evaluation_en')
var FSA_NITRITE = source('UK FSA: Safety of nitrates and nitrites as food additives', 'https://science.food.gov.uk/article/144676-safety-of-nitrates-and-nitrites-as-food-additives')
var RIVM_NITRITE = source('RIVM: Intake assessment of nitrites and nitrates as food additives', 'https://www.rivm.nl/bibliotheek/rapporten/2016-0208.pdf')
var EFSA_XANTHAN = source('EFSA Journal: Re-evaluation of xanthan gum (E 415)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7009887/')
var EFSA_CARRAGEENAN = source('EFSA: Call for data on carrageenan (E 407)', 'https://www.efsa.europa.eu/en/consultations/call/call-technical-and-toxicological-data-carrageenan-e-407-uses-foods')
var EFSA_CMC = source('EFSA: Call for data on sodium carboxymethylcellulose (E 466)', 'https://www.efsa.europa.eu/en/consultations/call/call-technical-and-toxicological-data-sodium')
var EFSA_ADDITIVES = source('EFSA: Food additives (lecithin E322, pectin E440 and others)', 'https://www.efsa.europa.eu/en/topics/topic/food-additives')

export var processingAdditivesGroup = defineIngredientGroup({
  id: 'processing-additives',
  name: 'رنگ، نگهدارنده گوشت و غلظت‌دهنده‌ها',
  icon: '🧫',
  ingredients: [
    defineIngredient({
      id: 'titanium-dioxide',
      name: 'تیتانیوم دی‌اکسید (E171)',
      aliases: ['دی اکسید تیتانیوم', 'E171', 'Titanium Dioxide', 'TiO2', 'رنگ سفید'],
      whatIsIt: 'رنگ‌دهنده‌ی سفید معدنی که به شکل ذرات ریز در شیرینی، آدامس و روکش‌ها می‌رود.',
      role: 'سفید و مات کردن ظاهر محصول.',
      verdict: Verdict.AVOID,
      verdictNote: 'EFSA در ۲۰۲۱ اعلام کرد نگرانی ژنوتوکسیسیتی را نمی‌توان رد کرد و ADI تعیین نشد. اتحادیه اروپا با رگولاسیون ۲۰۲۲/۶۳ مصرف آن را در غذا ممنوع کرد. وضعیت مقررات ایران را بررسی نکردم.',
      itemIds: ['snacks', 'dry-pastry', 'chocolate', 'guest-snacks', 'jelly-powder', 'cake-powder', 'popcorn', 'ice-cream', 'chewing-gum'],
      sources: [EFSA_E171, EC_REEVAL]
    }),
    defineIngredient({
      id: 'nitrite-nitrate',
      name: 'نیتریت و نیترات (E249–E252)',
      aliases: ['نیتریت سدیم', 'نیترات پتاسیم', 'E250', 'E249', 'E251', 'E252', 'Nitrite', 'Nitrate', 'نمک پخت'],
      whatIsIt: 'نمک‌هایی که برای نگهداری گوشت فرآوری‌شده و بعضی پنیرها به کار می‌روند.',
      role: 'جلوگیری از رشد باکتری، حفظ رنگ صورتی و طعم سوسیس و کالباس.',
      verdict: Verdict.CAUTION,
      verdictNote: 'EFSA ADI را برای نیترات ۳٫۷ و نیتریت ۰٫۰۷ میلی‌گرم بر کیلوگرم وزن بدن (به‌صورت یون) تعیین کرده است. در ۲۰۲۳ EFSA نیتروزآمین‌های تشکیل‌شده از آن‌ها را نگرانی سلامتی دانست و محدودیت‌ها سخت‌تر شد. مصرف کم و متنوع فرآورده‌ی گوشتی عاقلانه‌تر است.',
      itemIds: ['sausage', 'parmesan', 'cheese', 'canned-food', 'burger'],
      sources: [FSA_NITRITE, RIVM_NITRITE]
    }),
    defineIngredient({
      id: 'xanthan-gum',
      name: 'صمغ زانتان (E415)',
      aliases: ['زانتان', 'صمغ زانتان', 'E415', 'Xanthan Gum', 'غلظت‌دهنده'],
      whatIsIt: 'پلی‌ساکارید حاصل تخمیر میکروبی که در آب ژل غلیظ و پایدار می‌سازد.',
      role: 'غلیظ و یکنواخت نگه داشتن سس، سالاد و بستنی.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'EFSA می‌گوید ADI عددی لازم نیست و در مصارف گزارش‌شده نگرانی ایمنی نیست.',
      itemIds: ['sauce', 'mayonnaise-sauce', 'salad-seasoning', 'chocolate-sauce', 'ice-cream', 'cake-powder', 'pancake-powder', 'soup-powder'],
      sources: [EFSA_XANTHAN]
    }),
    defineIngredient({
      id: 'carrageenan',
      name: 'کاراگینان (E407)',
      aliases: ['کاراگینان', 'ژلان جلبکی', 'E407', 'Carrageenan'],
      whatIsIt: 'غلظت‌دهنده و ژل‌ساز استخراج‌شده از جلبک قرمز.',
      role: 'بافت نرم و جلوگیری از جدا شدن در بستنی، خامه، شیرکاکائو و دسر.',
      verdict: Verdict.CAUTION,
      verdictNote: 'EFSA نظر علمی داده و بعد اطلاعات بیشتر فنی و سم‌شناسی خواسته است. به منبع نرسیدم که جزئیات این نتیجه را تأیید کند، پس فقط می‌توانم بگویم بررسی در جریان بوده است.',
      itemIds: ['ice-cream', 'cream', 'hot-chocolate', 'jelly-powder', 'milk', 'sausage'],
      sources: [EFSA_CARRAGEENAN]
    }),
    defineIngredient({
      id: 'cellulose-gum',
      name: 'کربوکسی‌متیل سلولز (E466)',
      aliases: ['CMC', 'سلولز صمغی', 'E466', 'Carboxymethylcellulose', 'Cellulose Gum'],
      whatIsIt: 'مشتق سلولز که در آب غلیظ‌کننده است.',
      role: 'بافت بستنی، سس و محصولات کم‌چرب.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'EFSA ارزیابی کرده و داده‌های بیشتر خواسته؛ جزئیات نتیجه را در منابع خود نیافتم.',
      itemIds: ['ice-cream', 'sauce', 'mayonnaise-sauce', 'cake-powder', 'syrup'],
      sources: [EFSA_CMC]
    }),
    defineIngredient({
      id: 'lecithin-pectin',
      name: 'لسیتین (E322) و پکتین (E440)',
      aliases: ['لسیتین', 'لسیتین سویا', 'پکتین', 'E322', 'E440', 'Lecithin', 'Pectin'],
      whatIsIt: 'هر دو در خوراک‌ها به‌طور طبیعی هستند؛ لسیتین در زرده‌ی تخم‌مرغ و سویا و پکتین در میوه‌هایی مثل سیب.',
      role: 'لسیتین امولسیفایر در شکلات و کیک است و پکتین مربا و ژله را سفت می‌کند.',
      verdict: Verdict.GOOD,
      verdictNote: 'EFSA هر دو را جزو افزودنی‌های طبیعی دانسته که بازبینی ۲۰۲۱ شده‌اند. جزئیات نتیجه‌ی بازبینی را در منبع نیافتم؛ به‌طور کلی نشانه‌ی نگران‌کننده‌ای ندیدم.',
      itemIds: ['chocolate', 'cake-powder', 'ice-cream', 'jam', 'breakfast-jam', 'jelly-powder', 'mayonnaise-sauce', 'pancake-powder', 'biscuits-cookies', 'chocolate-spread', 'compote'],
      sources: [EFSA_ADDITIVES]
    })
  ]
})
