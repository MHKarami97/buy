import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var WHO_FATS_NEWS = source('WHO: WHO updates guidelines on fats and carbohydrates (2023)', 'https://www.who.int/news/item/17-07-2023-who-updates-guidelines-on-fats-and-carbohydrates')
var WHO_FATS_GUIDELINE = source('WHO guideline: Saturated fatty acid and trans-fatty acid intake for adults and children', 'https://www.who.int/publications/i/item/9789240073630')
var EFSA_STARCH = source('EFSA 2017: Re-evaluation of oxidised starch (E 1404) and other modified starches', 'https://efsa.onlinelibrary.wiley.com/doi/full/10.2903/j.efsa.2017.4911')
var EU_CITRIC_ASCORBIC = source('Commission Regulation (EU) 2020/1419 (EFSA conclusion on ascorbic acid; citric acid ADI not specified)', 'https://www.wb6cif.eu/wp-content/uploads/2020/10/CELEX_32020R1419_EN_TXT.pdf')
var EFSA_ASCORBIC = source('EFSA Journal 2015: Re-evaluation of ascorbic acid (E 300) and ascorbates', 'https://zendy.io/title/10.2903/j.efsa.2015.4087')
var EFSA_BHT = source('EFSA Journal 2012: Re-evaluation of BHT (E 321)', 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2012.2588')
var EFSA_BHA = source('EFSA Journal 2011: Re-evaluation of BHA (E 320)', 'https://ucrisportal.univie.ac.at/en/publications/scientific-opinion-on-the-re-evaluation-of-butylated-hydroxyaniso/')
var EFSA_TBHQ = source('EFSA 2016: Refined exposure assessment of TBHQ (E 319)', 'https://efsa.onlinelibrary.wiley.com/doi/pdf/10.2903/j.efsa.2016.4363')
var CODEX_FERMENTED = source('Codex Standard for Fermented Milks (CXS 243-2003)', 'https://www.fao.org/input/download/standards/400/CXS_243e.pdf')

export var commonFoodIngredientsGroup = defineIngredientGroup({
  id: 'common-food-ingredients',
  name: 'مواد رایج روی برچسب غذا',
  icon: '🥫',
  ingredients: [
    defineIngredient({
      id: 'saturated-fat',
      name: 'چربی اشباع (کره، روغن پالم، روغن نارگیل، چربی حیوانی)',
      aliases: ['چربی اشباع', 'روغن پالم', 'پالم', 'روغن نارگیل', 'روغن حیوانی', 'دنبه', 'کره حیوانی', 'Saturated Fat', 'Palm Oil', 'Coconut Oil', 'Ghee', 'روغن جامد'],
      whatIsIt: 'چربی‌های دارای پیوند اشباع که در دمای اتاق معمولاً جامدند و در چربی گوشت، کره، لبنیات پرچرب، روغن پالم و نارگیل زیاد است.',
      role: 'بافت، طعم و ماندگاری در محصولات سرخ‌شده، شیرینی و سس.',
      verdict: Verdict.CAUTION,
      verdictNote: 'WHO توصیه می‌کند چربی اشباع حداکثر ۱۰٪ انرژی روزانه و چربی ترانس کمتر از ۱٪ باشد و بهتر است بیشتر چربی مصرفی غیراشباع باشد. این فقط حد مصرف کل است؛ نباید یک محصول را فقط بر اساس وجود پالم رد کرد.',
      itemIds: ['butter', 'cream', 'cheese', 'parmesan', 'cooking-oil', 'cooking-oil-rice', 'fried-onions', 'frozen-fries', 'nuggets', 'sausage', 'red-meat', 'minced-meat', 'chocolate', 'dry-pastry', 'snacks', 'popcorn', 'ice-cream', 'cake-powder', 'halva', 'peanut-butter', 'cereal', 'chips', 'puffs-snacks', 'biscuits-cookies', 'chocolate-spread', 'burger', 'schnitzel', 'canned-tuna', 'noodles'],
      sources: [WHO_FATS_NEWS, WHO_FATS_GUIDELINE]
    }),
    defineIngredient({
      id: 'modified-starch',
      name: 'نشاسته‌ی اصلاح‌شده (E1404–E1452)',
      aliases: ['نشاسته اصلاح شده', 'نشاسته تغییریافته', 'نشاسته ذرت', 'نشاسته‌ی اصلاح‌شده', 'E1404', 'E1414', 'E1422', 'E1442', 'Modified Starch', 'غلظت‌دهنده'],
      whatIsIt: 'نشاسته‌ای که با فرایند فیزیکی یا شیمیایی تغییر کرده تا در حرارت، سرما یا اسید پایدار بماند.',
      role: 'غلیظ کردن و یکنواخت نگه داشتن سس، سوپ، ماست میوه‌ای، پودر کیک و غذای آماده.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'EFSA در ۲۰۱۷ نتیجه گرفت در مصارف گزارش‌شده نگرانی ایمنی نیست و ADI عددی لازم نیست. مثل نشاسته‌ی معمولی کالری دارد؛ فقط نشانه‌ی فرآوری بیشتر و مقدار ماده‌ی اصلی کمتر است.',
      itemIds: ['sauce', 'mayonnaise-sauce', 'yogurt', 'doogh', 'cottage-cheese', 'tomato-paste', 'canned-food', 'cake-powder', 'pancake-powder', 'jelly-powder', 'nuggets', 'frozen-fries', 'falafel', 'sausage', 'ice-cream', 'chocolate-sauce', 'vermicelli', 'soup-powder', 'burger', 'schnitzel', 'noodles'],
      sources: [EFSA_STARCH]
    }),
    defineIngredient({
      id: 'citric-acid',
      name: 'اسید سیتریک (E330)',
      aliases: ['اسید سیتریک', 'جوهر لیمو', 'ترشی لیمو', 'E330', 'Citric Acid', 'اسیدی‌کننده', 'تنظیم‌کننده اسیدیته'],
      whatIsIt: 'اسید آلی طبیعی در مرکبات که به‌صورت صنعتی نیز تولید می‌شود.',
      role: 'ترش‌کردن، تنظیم اسیدیته و کمک به نگهداری در رب، سس، مربا، نوشیدنی و کنسرو.',
      verdict: Verdict.GOOD,
      verdictNote: 'ADI آن «مشخص نشده» است؛ یعنی در سطوح فنی لازم خطری برای سلامت نیست. طبق مقررات ۲۰۲۰ اتحادیه اروپا، بازبینی کامل آن در برنامه‌ی EFSA به‌دلیل نگرانی کم هنوز در انتظار بود.',
      itemIds: ['tomato-paste', 'sauce', 'mayonnaise-sauce', 'jam', 'breakfast-jam', 'canned-food', 'pickles', 'olives', 'syrup', 'soft-drink', 'malt-drink', 'jelly-powder', 'lavashak', 'cake-powder', 'ice-cream', 'abghooreh', 'lemon-juice', 'chocolate', 'fruit-juice', 'energy-drink', 'gummies-candy', 'hard-candy', 'compote'],
      sources: [EU_CITRIC_ASCORBIC]
    }),
    defineIngredient({
      id: 'ascorbic-acid',
      name: 'اسید اسکوربیک (ویتامین C، E300)',
      aliases: ['ویتامین ث', 'ویتامین C', 'اسید اسکوربیک', 'E300', 'E301', 'E302', 'Ascorbic Acid', 'Vitamin C', 'آنتی‌اکسیدان'],
      whatIsIt: 'ویتامین C که به‌عنوان آنتی‌اکسیدان هم به غذا اضافه می‌شود.',
      role: 'جلوگیری از قهوه‌ای شدن و اکسید شدن در آب‌میوه، گوشت فرآوری‌شده، نان و روغن.',
      verdict: Verdict.GOOD,
      verdictNote: 'EFSA در ۲۰۱۵ اعلام کرد در مصارف گزارش‌شده نگرانی ایمنی نیست و ADI عددی لازم نیست.',
      itemIds: ['syrup', 'soft-drink', 'sausage', 'bread', 'toast-bread', 'cereal', 'jam', 'breakfast-jam', 'canned-food', 'dried-herbs', 'cake-powder', 'pickles', 'lemon-juice', 'fruit-juice'],
      sources: [EFSA_ASCORBIC, EU_CITRIC_ASCORBIC]
    }),
    defineIngredient({
      id: 'synthetic-antioxidants',
      name: 'آنتی‌اکسیدان‌های مصنوعی روغن (BHA، BHT، TBHQ)',
      aliases: ['BHT', 'BHA', 'TBHQ', 'E319', 'E320', 'E321', 'آنتی‌اکسیدان', 'ضد‌ترشیدگی', 'Butylated Hydroxytoluene', 'Butylated Hydroxyanisole', 'Tertiary Butylhydroquinone'],
      whatIsIt: 'آنتی‌اکسیدان‌های مصنوعی که چربی را دیرتر ترشیده می‌کنند.',
      role: 'ماندگاری روغن، چیپس، غلات صبحانه، آجیل و سرخ‌کردنی.',
      verdict: Verdict.CAUTION,
      verdictNote: 'EFSA در بازبینی ۲۰۱۲ برای BHT نگرانی ژنوتوکسیسیتی ندید و سرطان‌زایی را آستانه‌دار دانست. یک منبع غیررسمی می‌گوید مصرف کودکان در برخی کشورها از ADI بیشتر بوده، ولی تأیید نشد. ADI برای BHT برابر ۰٫۲۵ و برای BHA برابر ۱ میلی‌گرم بر کیلوگرم وزن بدن و برای TBHQ برابر ۰٫۷ از منبع‌های غیررسمی آمد و من تأییدش نکردم. در حد معمول مشکل حاد ندارند؛ می‌توانید محصول بدون آن‌ها را ترجیح دهید.',
      itemIds: ['cooking-oil', 'cooking-oil-rice', 'cooking-oil-zitun', 'snacks', 'popcorn', 'cereal', 'nuts', 'seeds', 'frozen-fries', 'nuggets', 'fried-onions', 'peanut-butter', 'dry-pastry', 'chips', 'puffs-snacks', 'canned-tuna', 'noodles', 'schnitzel'],
      sources: [EFSA_BHT, EFSA_BHA, EFSA_TBHQ]
    }),
    defineIngredient({
      id: 'yogurt-cultures-gelatin',
      name: 'کشت آغازگر، ژلاتین و نشاسته در ماست و دوغ',
      aliases: ['کشت آغازگر', 'استرپتوکوک ترموفیلوس', 'لاکتوباسیلوس بولگاریکوس', 'ژلاتین', 'ماست پروبیوتیک', 'پروبیوتیک', 'Streptococcus thermophilus', 'Lactobacillus delbrueckii', 'Gelatin', 'E441', 'Starter Culture', 'دوغ'],
      whatIsIt: 'ماست طبق استاندارد کدکس با کشت هم‌زیست دو باکتری Streptococcus thermophilus و Lactobacillus delbrueckii subsp. bulgaricus تولید می‌شود. ژلاتین و نشاسته فقط در محصولات خاص و به مقدار لازم فنی مجازند.',
      role: 'باکتری‌ها شیر را به ماست و دوغ تبدیل می‌کنند. ژلاتین و نشاسته بافت را سفت و یکنواخت می‌کنند.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'ماست ساده با شیر و کشت آغازگر ساده‌ترین فهرست را دارد. وجود ژلاتین یا نشاسته در ماست و دوغ طعم‌دار یا ماست حرارت‌دیده مجاز است؛ در ماست ساده نباید لازم باشد. طبق استاندارد کدکس حداقل پروتئین شیر ۲٫۷٪ است.',
      itemIds: ['yogurt', 'doogh', 'cottage-cheese', 'milk', 'cream'],
      sources: [CODEX_FERMENTED]
    })
  ]
})
