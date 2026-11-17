import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var EFSA_SULFITES = source('EFSA 2022: Follow-up of the re-evaluation of sulfur dioxide-sulfites (E 220-228)', 'https://www.efsa.europa.eu/en/plain-language-summary/follow-re-evaluation-sulfur-dioxide-e-220-sodium-sulfite-e-221-sodium')
var BFR_SULFITES = source('BfR: Sulphur dioxide and sulphites, EFSA re-evaluation identifies health risks at high consumption', 'https://www.bfr.bund.de/cm/349/sulphur-dioxide-and-sulphites-efsa-re-evaluation-identifies-health-risks-at-high-consumption-data-situation-still-incomplete.pdf')
var SOUTHAMPTON = source('Food & Drink Technology: Southampton six safety review', 'https://www.foodanddrinktechnology.com/news/488/southampton-six-safety-review/')
var AZO_EFSA = source('Bakery&Snacks: Allergic reactions to azo dyes unlikely, EFSA (secondary report)', 'https://www.bakeryandsnacks.com/Article/2010/10/08/Allergic-reactions-to-azo-dyes-in-foods-unlikely-EFSA/')

export var colorsSulfitesGroup = defineIngredientGroup({
  id: 'colors-sulfites',
  name: 'رنگ‌های آزو و سولفیت‌ها',
  icon: '🎨',
  ingredients: [
    defineIngredient({
      id: 'sulfites',
      name: 'سولفیت‌ها و دی‌اکسید گوگرد (E220–E228)',
      aliases: ['سولفیت', 'متابی‌سولفیت', 'دی اکسید گوگرد', 'E220', 'E221', 'E223', 'E224', 'E228', 'Sulfites', 'Sulphites', 'Sulfur Dioxide', 'SO2'],
      whatIsIt: 'گروهی از نگهدارنده‌ها و آنتی‌اکسیدان‌ها که از قهوه‌ای شدن و فساد میکروبی جلوگیری می‌کنند.',
      role: 'نگهداری میوه خشک، لواشک، مربا، آب‌میوه، سرکه و ترشی.',
      verdict: Verdict.CAUTION,
      verdictNote: 'برخی افراد (به‌ویژه مبتلایان به آسم) ممکن است واکنش شبه‌آلرژیک نشان دهند. EFSA در ۲۰۲۲ ADI موقت گروهی را به دلیل ناکافی بودن داده‌ها کنار گذاشت و ارزیابی را با حاشیه‌ی ایمنی (MoE) انجام داد؛ در سناریوی دقیق‌تر مصرف، MoE از حد ۸۰ کمتر بود و نگرانی ایمنی ایجاد کرد. در اتحادیه اروپا از ۱۰ میلی‌گرم بر کیلوگرم به بالا باید روی بسته بیاید. مبتلایان به آسم یا حساسیت باید فهرست را بخوانند.',
      itemIds: ['lavashak', 'jam', 'breakfast-jam', 'dates', 'nuts', 'vinegar', 'lemon-juice', 'pickles', 'olives', 'syrup', 'fried-onions', 'dried-herbs', 'raisins', 'compote', 'fruit-juice'],
      sources: [EFSA_SULFITES, BFR_SULFITES]
    }),
    defineIngredient({
      id: 'southampton-azo-colors',
      name: 'رنگ‌های آزو (تارترازین E102، سانست یلو E110، کارموزین E122، پونسو E124، آلورا E129، کینولین E104)',
      aliases: ['تارترازین', 'سانست یلو', 'کارموزین', 'آلورا رد', 'رنگ مصنوعی', 'رنگ خوراکی', 'Southampton Six', 'E102', 'E104', 'E110', 'E122', 'E124', 'E129', 'Tartrazine', 'Sunset Yellow', 'Carmoisine'],
      whatIsIt: 'شش رنگ‌دهنده‌ی مصنوعی که مطالعه‌ی دانشگاه ساوتهمپتون آن‌ها را (در ترکیب با نگهدارنده‌ی بنزوات) با بیش‌فعالی کودکان مرتبط دانست.',
      role: 'رنگی کردن نوشیدنی، شیرینی، ژله، پفک و پودر نوشیدنی.',
      verdict: Verdict.CAUTION,
      verdictNote: 'در اتحادیه اروپا محصول دارای این رنگ‌ها باید هشدار «ممکن است بر فعالیت و توجه کودکان اثر بگذارد» داشته باشد (گزارش ثانویه). EFSA واکنش آلرژیک شدید به آزو‌ها را بعید دانست. برای کودکان، محصول بدون رنگ مصنوعی ترجیح دارد.',
      itemIds: ['syrup', 'jelly-powder', 'cake-powder', 'popcorn', 'snacks', 'guest-snacks', 'dry-pastry', 'ice-cream', 'lavashak', 'soft-drink', 'malt-drink', 'cereal', 'chips', 'puffs-snacks', 'gummies-candy', 'hard-candy', 'energy-drink'],
      sources: [SOUTHAMPTON, AZO_EFSA]
    })
  ]
})
