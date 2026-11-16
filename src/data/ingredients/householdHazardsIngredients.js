import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var MEDLINE_NAOH = source('MedlinePlus: Sodium hydroxide poisoning', 'https://medlineplus.gov/ency/article/002487.htm')
var MEDLINE_DRAIN = source('MedlinePlus: Drain cleaner poisoning', 'https://medlineplus.gov/ency/article/002779.htm')
var EPA_PERMETHRIN = source('US EPA: Permethrin fact sheet', 'https://www3.epa.gov/pesticides/chem_search/reg_actions/reregistration/fs_PC-109701_1-Jun-06.pdf')
var EPA_PYRETHROIDS = source('US EPA: Synthetic pyrethroids for mosquito control', 'https://www.epa.gov/mosquitocontrol/permethrin-resmethrin-d-phenothrin-sumithrinr-synthetic-pyrethroids-mosquito')
var NPIC_PERMETHRIN = source('NPIC (Oregon State University): Permethrin general fact sheet', 'https://npic.orst.edu/factsheets/PermGen.html')

export var householdHazardsGroup = defineIngredientGroup({
  id: 'household-hazards',
  name: 'مواد خورنده و حشره‌کش',
  icon: '⚠️',
  ingredients: [
    defineIngredient({
      id: 'sodium-hydroxide',
      name: 'سود سوزآور (هیدروکسید سدیم)',
      aliases: ['سود', 'سود سوزآور', 'هیدروکسید سدیم', 'قلیا', 'سود پوست‌کن', 'Sodium Hydroxide', 'Caustic Soda', 'Lye', 'NaOH', 'لوله‌بازکن'],
      whatIsIt: 'باز قوی و خورنده که در لوله‌بازکن، پاک‌کننده‌ی فر و برخی صابون‌ها به کار می‌رود.',
      role: 'حل کردن چربی و مو و باز کردن لوله.',
      verdict: Verdict.AVOID,
      verdictNote: 'تماس، استنشاق یا بلعیدن می‌تواند سوختگی شدید پوست، چشم و مری ایجاد کند. اگر بلعیده شد فوراً اورژانس بگیرید و بدون توصیه‌ی پزشک یا مرکز مسمومیت استفراغ نکنید. با ماده‌ی خنثی‌کننده مثل سرکه یا آبلیمو درمان نکنید. دستکش، عینک و تهویه ضروری است و دور از کودک نگه دارید.',
      itemIds: ['drain-cleaner', 'multi-purpose-cleaner', 'scouring-powder', 'floor-cleaner'],
      sources: [MEDLINE_NAOH, MEDLINE_DRAIN]
    }),
    defineIngredient({
      id: 'pyrethroids',
      name: 'پیرتروئیدها (پرمترین و مشابه) در حشره‌کش',
      aliases: ['پرمترین', 'سایپرمترین', 'دلتامترین', 'پیرتروئید', 'حشره‌کش', 'Permethrin', 'Cypermethrin', 'Deltamethrin', 'Pyrethroid', 'Insecticide'],
      whatIsIt: 'حشره‌کش‌های مصنوعی شبیه ترکیبات طبیعی گل داوودی که روی سیستم عصبی حشره اثر می‌کنند.',
      role: 'کشتن مگس، پشه و سوسک در اسپری و حشره‌کش خانگی.',
      verdict: Verdict.CAUTION,
      verdictNote: 'EPA در مصرف خانگی طبق برچسب خطر قابل‌توجه برای انسان نیافته و غلظت اسپری مصرفی را ۰٫۵٪ محدود کرده است. در مواجهه‌ی زیاد مثل نشت یا ریختن، می‌تواند روی سیستم عصبی اثر بگذارد. EPA پرمترین را در صورت خورده شدن «احتمالاً سرطان‌زا» دانسته است. از مصرف روی غذا، ظرف و در حضور کودک و حیوان خانگی خودداری کنید. برای گربه (حساسیت شدید) خطرناک است؛ این نکته از منابع بالا نیامده و از دانش عمومی است.',
      itemIds: ['insect-spray'],
      sources: [EPA_PERMETHRIN, EPA_PYRETHROIDS, NPIC_PERMETHRIN]
    })
  ]
})
