import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var SCCS_METHYL = source('SCCS Opinion on Methylparaben (SCCS/1649/22 final, 2023)', 'https://health.ec.europa.eu/system/files/2023-12/sccs_o_276_final.pdf')
var SCCS_PROPYL = source('SCCS Opinion on Propylparaben', 'https://health.ec.europa.eu/system/files/2022-08/sccs_o_243.pdf')
var EU_PARABENS = source('Commission Regulation (EU) No 1004/2014 on parabens in cosmetics', 'https://www.legislation.gov.uk/eur/2014/1004/data.html')
var CIR_ALKYL_SULFATES = source('Cosmetic Ingredient Review: SLS and alkyl sulfates findings', 'https://www.cir-safety.org/sites/default/files/imports/alerts.pdf')
var CIR_SLES = source('CIR Final Report of the Amended Safety Assessment of Sodium Laureth Sulfate', 'https://journals.sagepub.com/doi/10.1177/1091581810373151')
var WHO_FLUORIDE = source('WHO Essential Medicines expert review: Fluoride toothpaste, dental caries', 'https://cdn.who.int/media/docs/default-source/essential-medicines/2021-eml-expert-committee/expert-reviews/a14_fluoridetp_rev2.pdf?sfvrsn=c35d4123_7')
var COCHRANE_FLUORIDE = source('Cochrane review: Fluoride toothpastes of different concentrations for preventing dental caries', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6398117/')

var CARE_ITEMS = ['shampoo', 'body-wash', 'liquid-soap', 'face-wash', 'conditioner', 'hair-mask', 'hair-gel', 'moisturizer', 'hand-cream', 'sunscreen', 'wet-wipes', 'deodorant', 'lip-balm', 'baby-care', 'body-lotion', 'body-spray', 'makeup-remover']

export var personalCareIngredientsGroup = defineIngredientGroup({
  id: 'personal-care-ingredients',
  name: 'بهداشت شخصی و آرایشی',
  icon: '🧴',
  ingredients: [
    defineIngredient({
      id: 'parabens',
      name: 'پارابن‌ها (متیل‌، اتیل‌، پروپیل‌ و بوتیل‌پارابن)',
      aliases: ['پارابن', 'متیل پارابن', 'پروپیل پارابن', 'بوتیل پارابن', 'اتیل پارابن', 'Methylparaben', 'Propylparaben', 'Butylparaben', 'Ethylparaben', 'Paraben', 'نگهدارنده آرایشی'],
      whatIsIt: 'گروه استرهای اسید پارا-هیدروکسی‌بنزوئیک که نگهدارنده‌ی ضدمیکروب در فرآورده‌های آرایشی و بهداشتی هستند.',
      role: 'جلوگیری از رشد کپک و باکتری در شامپو، کرم و لوسیون.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'SCCS اروپا متیل‌پارابن را تا ۰٫۴٪ ایمن می‌داند و پروپیل‌پارابن را تا ۰٫۱۴٪ (با نگرانی فعالیت اندوکرین). مجموع همه‌ی پارابن‌ها در یک محصول تا ۰٫۸٪ مجاز است. پروپیل و بوتیل‌پارابن در محصول بدون آبکشی ناحیه‌ی پوشک کودک زیر ۳ سال ممنوع است (گزارش ثانویه).',
      itemIds: CARE_ITEMS,
      sources: [SCCS_METHYL, SCCS_PROPYL, EU_PARABENS]
    }),
    defineIngredient({
      id: 'sulfate-surfactants',
      name: 'سولفات‌های شوینده (SLS، SLES)',
      aliases: ['سدیم لوریل سولفات', 'سدیم لورث سولفات', 'SLS', 'SLES', 'Sodium Lauryl Sulfate', 'Sodium Laureth Sulfate', 'سولفات', 'کف‌ساز'],
      whatIsIt: 'شوینده‌های (سورفکتانت) کف‌ساز که چربی و آلودگی را می‌شویند.',
      role: 'کف و پاک‌کنندگی در شامپو، شامپو بدن، خمیردندان و مایع دستشویی.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'CIR می‌گوید SLS در محصول شست‌وشو که سریع آبکشی می‌شود ایمن است، ولی در تماس طولانی با پوست از غلظت ۱٪ نباید بیشتر باشد؛ تحریک چشم و پوست با غلظت بیشتر می‌شود. SLES هم تحریک‌کننده است ولی حساسیت‌زا نیست. پوست حساس یا خشک بهتر است فرمول بدون سولفات را امتحان کند.',
      itemIds: ['shampoo', 'body-wash', 'liquid-soap', 'face-wash', 'toothpaste', 'wet-wipes', 'carpet-shampoo', 'baby-care'],
      sources: [CIR_ALKYL_SULFATES, CIR_SLES]
    }),
    defineIngredient({
      id: 'fluoride',
      name: 'فلوراید (سدیم فلوراید، سدیم مونوفلوروفسفات)',
      aliases: ['فلوراید', 'فلورایدی', 'سدیم فلوراید', 'مونوفلوروفسفات', 'ppm فلوراید', 'Fluoride', 'Sodium Fluoride', 'Sodium Monofluorophosphate', 'MFP'],
      whatIsIt: 'ترکیب فلوراید که مینای دندان را در برابر اسید مقاوم می‌کند.',
      role: 'پیشگیری از پوسیدگی دندان در خمیردندان و دهان‌شویه.',
      verdict: Verdict.GOOD,
      verdictNote: 'WHO خمیردندان فلوراید ۱۰۰۰ تا ۱۵۰۰ ppm را استاندارد توصیه‌شده برای پیشگیری از پوسیدگی می‌داند. مرور کاکرین نشان داد ۱۴۵۰–۱۵۰۰ ppm پوسیدگی را کمی بیشتر از ۱۰۰۰–۱۲۵۰ ppm کم می‌کند. برای کودکان خردسال میزان خمیردندان را طبق توصیه‌ی دندان‌پزشک تنظیم کنید، چون بلعیدن فلوراید زیاد مناسب نیست (این نکته از منبع نیامده؛ با دندان‌پزشک مشورت کنید).',
      itemIds: ['toothpaste', 'mouthwash'],
      sources: [WHO_FLUORIDE, COCHRANE_FLUORIDE]
    })
  ]
})
