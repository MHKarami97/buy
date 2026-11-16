import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var EFSA_NISIN = source('EFSA 2017: Safety of nisin (E 234) as a food additive in light of new toxicological data', 'https://pubmed.ncbi.nlm.nih.gov/32625365/')
var EFSA_NISIN_EXT = source('EFSA Journal 2017: Safety of nisin (E 234), extension of use', 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2017.5063')
var EFSA_RIBONUCLEOTIDES = source('EFSA: Call for data for the re-evaluation of ribonucleotides (E 626-635)', 'https://www.efsa.europa.eu/sites/default/files/2023-06/call-for-data-ribonucleotides.pdf')
var WHO_WHEAT_FORTIFICATION = source('WHO Guideline: Fortification of wheat flour with vitamins and minerals as a public health strategy', 'https://iris.who.int/items/c77a8896-5a03-4a38-a85a-e8b9f6deeef8')
var WHO_FORTIFICATION_GUIDE = source('WHO: Guidelines on food fortification with micronutrients', 'https://www.who.int/docs/default-source/micronutrients/gff-contents-en.pdf?sfvrsn=f964afe1_2')
var EFSA_UL = source('EFSA: Summary of Tolerable Upper Intake Levels (2024)', 'https://www.efsa.europa.eu/sites/default/files/2024-05/ul-summary-report.pdf')

export var microIngredientsGroup = defineIngredientGroup({
  id: 'micro-ingredients',
  name: 'نگهدارنده‌ی طبیعی، طعم‌دهنده و مکمل‌ها',
  icon: '🧬',
  ingredients: [
    defineIngredient({
      id: 'nisin',
      name: 'نیسین (E234)',
      aliases: ['نیسین', 'E234', 'Nisin', 'نگهدارنده طبیعی', 'باکتریوسین'],
      whatIsIt: 'پپتید ضدباکتری که از باکتری لاکتوکوکوس لاکتیس تولید می‌شود.',
      role: 'جلوگیری از رشد باکتری‌های فساد و بعضی عوامل بیماری‌زا در پنیر، فرآورده‌ی گوشتی حرارت‌دیده و کنسرو.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'EFSA در ۲۰۰۶ ADI را ۰٫۱۳ میلی‌گرم بر کیلوگرم وزن بدن تأیید کرد و در ۲۰۱۷ با داده‌ی جدید آن را به ۱ میلی‌گرم نیسین A بر کیلوگرم افزایش داد. مصرف همه‌ی گروه‌ها زیر ADI برآورد شد. EFSA همچنین خواست خطر مقاومت آنتی‌بیوتیکی جداگانه بررسی شود.',
      itemIds: ['cheese', 'cottage-cheese', 'parmesan', 'sausage', 'canned-food', 'cream'],
      sources: [EFSA_NISIN, EFSA_NISIN_EXT]
    }),
    defineIngredient({
      id: 'ribonucleotides',
      name: 'ریبونوکلئوتیدها (E626–E635، اینوزینات و گوانیلات)',
      aliases: ['اینوزینات', 'گوانیلات', 'دی‌سدیم اینوزینات', 'دی‌سدیم گوانیلات', 'E627', 'E631', 'E635', 'I+G', 'Disodium Inosinate', 'Disodium Guanylate', 'تقویت‌کننده طعم'],
      whatIsIt: 'نمک‌های نوکلئوتید؛ مواد سازنده‌ی DNA و RNA که در گوشت و قارچ هم به‌طور طبیعی هستند و طعم اومامی را زیاد می‌کنند.',
      role: 'تقویت طعم گوشتی در ادویه، سوپ آماده، چیپس و سس، معمولاً همراه گلوتامات.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'JECFA ADI را «مشخص نشده» اعلام کرده و EFSA با فرض سمیت ذاتی کم، بازبینی را در دست دارد (فراخوان ۲۰۲۳). افراد مبتلا به نقرس یا مشکل پورین ممکن است محدودیت داشته باشند (این نکته از منبع نیامده؛ با پزشک مشورت کنید).',
      itemIds: ['spices', 'salad-seasoning', 'sauce', 'canned-food', 'snacks', 'popcorn', 'sausage', 'nuggets', 'fried-onions'],
      sources: [EFSA_RIBONUCLEOTIDES]
    }),
    defineIngredient({
      id: 'iron-zinc-fortification',
      name: 'آهن و روی (غنی‌سازی)',
      aliases: ['آهن', 'روی', 'فروس فومارات', 'سولفات آهن', 'فرو سولفات', 'ویتامین‌های گروه B', 'ویتامین D', 'ویتامین A', 'غنی‌شده', 'Iron', 'Zinc', 'Fortified', 'Ferrous Fumarate'],
      whatIsIt: 'مواد معدنی و ویتامین‌هایی که برای پیشگیری از کم‌خونی و کمبود ریزمغذی به آرد، غلات و برخی فرآورده‌ها اضافه می‌شود.',
      role: 'جبران کمبود ریزمغذی در جمعیت با مصرف زیاد نان و غلات.',
      verdict: Verdict.GOOD,
      verdictNote: 'WHO غنی‌سازی آرد گندم را با آهن با زیست‌دسترسی بالا و اسید فولیک توصیه می‌کند و غنی‌سازی با روی را هم ممکن می‌داند. شرط آن است که از سقف مصرف مجاز (UL) بالاتر نرود. برای آهن، EFSA به‌جای UL فقط «سطح مصرف ایمن» داده است، چون داده‌ی کافی نبود. مصرف مکمل آهن باید با نظر پزشک باشد.',
      itemIds: ['flour', 'bread', 'breakfast-bread', 'toast-bread', 'pasta', 'cereal', 'cake-powder', 'pancake-powder', 'breadcrumbs', 'vermicelli', 'milk', 'oats', 'hot-chocolate'],
      sources: [WHO_WHEAT_FORTIFICATION, WHO_FORTIFICATION_GUIDE, EFSA_UL]
    })
  ]
})
