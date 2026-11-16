import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var EFSA_VITD_UL = source('EFSA 2023: Tolerable upper intake level for vitamin D', 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2023.8145')
var EFSA_VITD_2012 = source('EFSA 2012: Upper intake levels reviewed for vitamin D and calcium', 'https://www.efsa.europa.eu/en/press/news/120727-0')
var EFSA_MCPD_NEWS = source('EFSA 2018: Revised safe intake for 3-MCPD in vegetable oils and food', 'https://www.efsa.europa.eu/en/press/news/180110')
var EFSA_MCPD_2016 = source('EFSA Journal 2016: Risks for human health related to 3- and 2-MCPD and glycidol esters', 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2016.4426')

export var vitaminsContaminantsGroup = defineIngredientGroup({
  id: 'vitamins-contaminants',
  name: 'ویتامین D و آلاینده‌های روغن',
  icon: '🧴',
  ingredients: [
    defineIngredient({
      id: 'vitamin-d',
      name: 'ویتامین D (غنی‌سازی)',
      aliases: ['ویتامین D', 'ویتامین دی', 'کوله‌کلسیفرول', 'D3', 'ارگوکلسیفرول', 'D2', 'Vitamin D', 'Cholecalciferol', 'غنی‌شده با ویتامین D'],
      whatIsIt: 'ویتامین محلول در چربی که جذب کلسیم و سلامت استخوان را تنظیم می‌کند و گاهی به شیر، روغن و غلات اضافه می‌شود.',
      role: 'جبران کمبود ویتامین D در جمعیتی که نور آفتاب یا غذای حاوی آن کم دارد.',
      verdict: Verdict.GOOD,
      verdictNote: 'EFSA در ۲۰۲۳ سقف مصرف مجاز (UL) را برای بزرگسالان ۱۰۰ میکروگرم در روز تأیید کرد و در ۲۰۱۲ برای کودکان ۱ تا ۱۰ سال ۵۰ میکروگرم تعیین کرده بود. مصرف همزمان مکمل و غذای غنی‌شده را جمع بزنید و مقدار مکمل را پزشک تعیین کند.',
      itemIds: ['milk', 'butter', 'cooking-oil', 'cereal', 'bread', 'toast-bread', 'yogurt', 'cheese', 'eggs', 'fish'],
      sources: [EFSA_VITD_UL, EFSA_VITD_2012]
    }),
    defineIngredient({
      id: 'mcpd-glycidyl-esters',
      name: 'آلاینده‌های روغن تصفیه‌شده (3-MCPD و گلیسیدیل استر)',
      aliases: ['3-MCPD', 'گلیسیدول', 'گلیسیدیل استر', 'روغن تصفیه‌شده', 'Glycidyl Esters', 'MCPD', 'آلاینده فرآیند'],
      whatIsIt: 'آلاینده‌هایی که ناخواسته در تصفیه‌ی روغن‌های گیاهی در دمای بالا (به‌ویژه پالم) تشکیل می‌شوند. این‌ها افزودنی نیستند و روی برچسب نمی‌آیند.',
      role: 'نقش کاربردی ندارند؛ فقط حاصل فرایند تولید هستند.',
      verdict: Verdict.CAUTION,
      verdictNote: 'EFSA در ۲۰۱۸ مقدار مصرف قابل تحمل روزانه (TDI) را برای 3-MCPD، ۲ میکروگرم بر کیلوگرم وزن بدن تعیین کرد (بالاتر از ۰٫۸ ارزیابی ۲۰۱۶). برای مصرف‌کنندگان زیاد در سنین پایین نگرانی بالقوه باقی ماند. گلیسیدیل استرها در بدن به گلیسیدول تبدیل می‌شوند که ژنوتوکسیک و سرطان‌زا است.',
      itemIds: ['cooking-oil', 'cooking-oil-rice', 'frozen-fries', 'nuggets', 'snacks', 'dry-pastry', 'cake-powder', 'peanut-butter', 'chocolate'],
      sources: [EFSA_MCPD_NEWS, EFSA_MCPD_2016]
    })
  ]
})
