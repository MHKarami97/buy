import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var EC_SWEETENERS = source('European Commission Knowledge Gateway: Acceptable daily intake of sweeteners in the EU', 'https://knowledge-for-policy.ec.europa.eu/health-promotion-knowledge-gateway/sugars-sweeteners-7_en')
var EFSA_E962 = source('EFSA: Salt of aspartame-acesulfame (E 962) is safe at current exposure levels', 'https://www.efsa.europa.eu/en/news/efsa-concludes-salt-aspartame-acesulfame-e-962-safe-current-exposure-levels')
var EFSA_ACEK = source('EFSA Journal 2025: Re-evaluation of acesulfame K (E 950)', 'https://efsa.onlinelibrary.wiley.com/doi/pdf/10.2903/j.efsa.2025.9317')
var EFSA_MSG = source('EFSA: Glutamates added to food (group ADI 30 mg/kg bw/day)', 'https://www.efsa.europa.eu/en/press/news/170712')

var DRINK_ITEMS = ['soft-drink', 'malt-drink', 'syrup', 'hot-chocolate', 'jelly-powder', 'jam', 'breakfast-jam', 'chocolate-sauce', 'cereal', 'dry-pastry', 'snacks']

export var sweetenersGroup = defineIngredientGroup({
  id: 'sweeteners-enhancers',
  name: 'شیرین‌کننده‌ها و تقویت‌کننده طعم',
  icon: '🍬',
  ingredients: [
    defineIngredient({
      id: 'aspartame',
      name: 'آسپارتام (E951)',
      aliases: ['آسپارتام', 'E951', 'Aspartame', 'شیرین‌کننده مصنوعی', 'بدون قند'],
      whatIsIt: 'شیرین‌کننده مصنوعی کم‌کالری که بسیار شیرین‌تر از شکر است.',
      role: 'جایگزین شکر در نوشیدنی رژیمی، ژله، آدامس و مربای کم‌قند.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'EFSA ADI را ۴۰ میلی‌گرم بر کیلوگرم وزن بدن در روز تأیید کرده و می‌گوید مصرف فعلی در همه‌ی گروه‌های سنی زیر این حد است. افراد مبتلا به فنیل‌کتونوری نباید مصرف کنند (هشدار روی بسته).',
      itemIds: DRINK_ITEMS,
      sources: [EFSA_E962, EC_SWEETENERS]
    }),
    defineIngredient({
      id: 'acesulfame-k',
      name: 'استه‌سولفام پتاسیم (E950)',
      aliases: ['استوسولفام', 'اسه‌سولفام', 'E950', 'Acesulfame K', 'Ace-K'],
      whatIsIt: 'شیرین‌کننده مصنوعی بدون کالری که معمولاً همراه شیرین‌کننده‌های دیگر به کار می‌رود.',
      role: 'کاهش قند در نوشیدنی، دسر و شیرینی.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'ADI قدیمی ۹ میلی‌گرم بود. EFSA در بازبینی اخیر آن را ۱۵ میلی‌گرم بر کیلوگرم وزن بدن در روز اعلام کرده و نگرانی ایمنی در مصرف فعلی ندیده است. منابع قدیمی‌تر هنوز عدد ۹ را نشان می‌دهند.',
      itemIds: DRINK_ITEMS,
      sources: [EFSA_E962, EFSA_ACEK, EC_SWEETENERS]
    }),
    defineIngredient({
      id: 'sucralose',
      name: 'سوکرالوز (E955)',
      aliases: ['سوکرالوز', 'E955', 'Sucralose', 'اسپلندا'],
      whatIsIt: 'شیرین‌کننده مصنوعی که از شکر ساخته و کلردار می‌شود و حدود صدها برابر شکر شیرین است.',
      role: 'شیرین‌کننده بدون کالری در نوشیدنی و محصولات رژیمی که در حرارت هم پایدار است.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'ADI اتحادیه اروپا ۱۵ میلی‌گرم بر کیلوگرم وزن بدن در روز است.',
      itemIds: DRINK_ITEMS,
      sources: [EC_SWEETENERS]
    }),
    defineIngredient({
      id: 'saccharin',
      name: 'ساخارین (E954)',
      aliases: ['ساخارین', 'E954', 'Saccharin', 'قند مصنوعی'],
      whatIsIt: 'قدیمی‌ترین شیرین‌کننده مصنوعی؛ بسیار شیرین و با پس‌طعم فلزی.',
      role: 'شیرین‌کننده ارزان در نوشیدنی و تنقلات.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'EFSA در ۲۰۲۴ ADI را ۹ میلی‌گرم بر کیلوگرم وزن بدن در روز تعیین کرده است.',
      itemIds: DRINK_ITEMS,
      sources: [EC_SWEETENERS]
    }),
    defineIngredient({
      id: 'steviol-glycosides',
      name: 'استویا / گلیکوزیدهای استویول (E960)',
      aliases: ['استویا', 'استویوزید', 'ریبادیوزید', 'E960', 'Stevia', 'Steviol Glycosides'],
      whatIsIt: 'شیرین‌کننده برگرفته از برگ گیاه استویا که به‌صورت عصاره‌ی تصفیه‌شده در غذا می‌آید.',
      role: 'شیرین‌کننده بدون کالری برای نوشیدنی و محصولات «طبیعی» یا رژیمی.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'ADI اتحادیه اروپا ۴ میلی‌گرم بر کیلوگرم وزن بدن (بر پایه‌ی استویول) است؛ پایین‌تر از دیگر شیرین‌کننده‌ها، پس مصرف خیلی زیاد را در نظر بگیرید.',
      itemIds: DRINK_ITEMS,
      sources: [EC_SWEETENERS]
    }),
    defineIngredient({
      id: 'monosodium-glutamate',
      name: 'گلوتامات / ام‌اس‌جی (E620–E625)',
      aliases: ['گلوتامات', 'مونوسدیم گلوتامات', 'ام اس جی', 'MSG', 'E621', 'E620', 'Glutamate', 'تقویت‌کننده طعم', 'اسید گلوتامیک'],
      whatIsIt: 'نمک اسید آمینه‌ی گلوتامیک که طعم «اومامی» می‌دهد و به شکل طبیعی در گوجه و پنیر پارمزان هم هست.',
      role: 'تقویت طعم در ادویه‌ی آماده، سوپ، سس، چیپس و فرآورده‌ی گوشتی.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'EFSA در ۲۰۱۷ ADI گروهی را ۳۰ میلی‌گرم بر کیلوگرم وزن بدن در روز (به‌صورت اسید گلوتامیک) تعیین کرد. چون در چند محصول همزمان می‌آید، مصرف روزانه از چند منبع را جمع بزنید.',
      itemIds: ['spices', 'salad-seasoning', 'sauce', 'canned-food', 'sausage', 'nuggets', 'falafel', 'snacks', 'popcorn', 'fried-onions', 'frozen-fries'],
      sources: [EFSA_MSG]
    })
  ]
})
