import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var EFSA_CAFFEINE = source('EFSA: Caffeine (safe intake levels)', 'https://www.efsa.europa.eu/en/topics/topic/caffeine')
var EFSA_CAFFEINE_OP = source('EFSA Journal 2015: Scientific opinion on the safety of caffeine', 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2015.4102')
var JECFA_NATAMYCIN = source('JECFA database: Natamycin (ADI 0-0.3 mg/kg bw, 2024)', 'https://apps.who.int/food-additives-contaminants-jecfa-database/Home/Chemical/3255')
var EFSA_NATAMYCIN = source('EFSA 2009: Use of natamycin (E 235) as a food additive', 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2009.1412')

export var foodExtraGroup = defineIngredientGroup({
  id: 'food-extra',
  name: 'کافئین و نگهدارنده‌ی پنیر',
  icon: '☕',
  ingredients: [
    defineIngredient({
      id: 'caffeine',
      name: 'کافئین',
      aliases: ['کافئین', 'کافیین', 'کافئین', 'Caffeine', 'نوشیدنی انرژی‌زا', 'محرک', 'قهوه', 'چای', 'کولا'],
      whatIsIt: 'ماده‌ی محرک طبیعی در قهوه، چای و دانه‌ی کاکائو که به برخی نوشیدنی‌ها هم اضافه می‌شود.',
      role: 'افزایش هوشیاری و طعم تلخ.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'EFSA می‌گوید مصرف روزانه تا ۴۰۰ میلی‌گرم و دوز یک‌باره تا ۲۰۰ میلی‌گرم (از همه‌ی منابع) برای بزرگسال سالم، به‌جز زنان باردار، نگرانی ایمنی ندارد. مصرف ۱۰۰ میلی‌گرم نزدیک خواب می‌تواند خواب را در برخی افراد مختل کند. برای زنان باردار یا شیرده سقف روزانه ۲۰۰ میلی‌گرم است. برای کودکان و نوجوانان سقف ۳ میلی‌گرم به ازای هر کیلوگرم وزن بدن توصیه شده است.',
      itemIds: ['coffee', 'instant-coffee', 'tea', 'black-tea', 'tea-bags', 'green-tea', 'soft-drink', 'hot-chocolate', 'chocolate', 'cocoa'],
      sources: [EFSA_CAFFEINE, EFSA_CAFFEINE_OP]
    }),
    defineIngredient({
      id: 'natamycin',
      name: 'ناتامایسین (E235)',
      aliases: ['ناتامایسین', 'پیمارسین', 'E235', 'Natamycin', 'Pimaricin', 'ضدکپک پنیر'],
      whatIsIt: 'ضدقارچ طبیعی که از باکتری استرپتومایسس تولید می‌شود.',
      role: 'جلوگیری از کپک روی سطح پنیرهای رسیده و غلاف سوسیس خشک.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'JECFA در ۲۰۲۴ ADI را ۰ تا ۰٫۳ میلی‌گرم بر کیلوگرم وزن بدن دوباره تأیید کرد و نگرانی مقاومت آنتی‌بیوتیکی را ندید. EFSA در ۲۰۰۹ ADI جدا نداد، ولی استفاده‌ی سطحی روی پوست پنیر و غلاف سوسیس را نگران‌کننده ندانست. پوست پنیر را نخورید.',
      itemIds: ['cheese', 'parmesan', 'sausage'],
      sources: [JECFA_NATAMYCIN, EFSA_NATAMYCIN]
    })
  ]
})
