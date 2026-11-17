import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var SCCS_ALUMINIUM = source('SCCS Final Opinion on the safety of aluminium in cosmetic products, Submission IV (2024)', 'https://health.ec.europa.eu/latest-updates/sccs-final-opinion-safety-aluminium-cosmetic-products-submission-iv-2024-04-04_en')
var SCCS_ALUMINIUM_III = source('SCCS Opinion on the safety of aluminium in cosmetic products, Submission III', 'https://hal.science/hal-03969479')
var EU_ZINC_OXIDE = source('Commission Regulation (EU) 2016/621 on zinc oxide as UV filter', 'https://www.legislation.gov.uk/eur/2016/621/introduction/data.xht')
var SCCS_TIO2_SPRAY = source('SCCS Opinion on titanium dioxide (nano) as UV-filter in sprays', 'https://health.ec.europa.eu/document/download/45f152a2-45dc-4be0-81fd-7487af3b8dea_en')
var EC_FRAGRANCE = source('European Commission: Fragrance allergens labelling', 'https://single-market-economy.ec.europa.eu/sectors/cosmetics/cosmetic-products-specific-topics/fragrance-allergens-labelling_en')
var EU_2023_1545 = source('Commission Regulation (EU) 2023/1545 on fragrance allergen labelling', 'https://eur-lex.europa.eu/eli/reg/2023/1545/oj/eng')

export var personalCareExtraGroup = defineIngredientGroup({
  id: 'personal-care-extra',
  name: 'ضدتعریق، ضدآفتاب و عطر',
  icon: '☀️',
  ingredients: [
    defineIngredient({
      id: 'aluminium-antiperspirants',
      name: 'ترکیبات آلومینیوم (ضدتعریق)',
      aliases: ['آلومینیوم', 'آلومینیوم کلروهیدرات', 'زاج', 'آلوم', 'Aluminium Chlorohydrate', 'Aluminum Zirconium', 'Antiperspirant', 'ضد تعریق', 'Aluminium'],
      whatIsIt: 'نمک‌های آلومینیوم که منافذ عرق را موقتاً می‌بندند و ماده‌ی فعال بیشتر ضدتعریق‌هاست.',
      role: 'کاهش تعریق زیر بغل.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'SCCS در ۲۰۲۴ ترکیبات آلومینیوم را تا سقف‌های مشخص برای هر دسته محصول ایمن اعلام کرد. در اسپری‌ها شرط این است که ذرات و قطرات کوچک‌تر از ۱۰ میکرومتر بیشتر از ۲۰٪ ذرات پراکنده‌شده نباشد. این ارزیابی فقط مواجهه از لوازم آرایشی را در نظر گرفته است.',
      itemIds: ['deodorant', 'body-spray'],
      sources: [SCCS_ALUMINIUM, SCCS_ALUMINIUM_III]
    }),
    defineIngredient({
      id: 'mineral-uv-filters',
      name: 'فیلتر معدنی ضدآفتاب (زینک اکسید و تیتانیوم دی‌اکسید)',
      aliases: ['زینک اکسید', 'اکسید روی', 'تیتانیوم دی‌اکسید ضدآفتاب', 'ضدآفتاب فیزیکی', 'ضدآفتاب معدنی', 'Zinc Oxide', 'Titanium Dioxide', 'CI 77891', 'CI 77947', 'Nano', 'نانو'],
      whatIsIt: 'ذرات معدنی که نور فرابنفش را بازتاب یا جذب می‌کنند و در ضدآفتاب «فیزیکی» استفاده می‌شوند.',
      role: 'محافظت پوست در برابر UV.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'SCCS و کمیسیون اروپا زینک اکسید را تا ۲۵٪ (نانو و غیرنانو) در ضدآفتاب‌های غیر اسپری ایمن می‌دانند و نبود جذب از پوست را گزارش کرده‌اند. نانوذرات تیتانیوم دی‌اکسید هم تا ۲۵٪ روی پوست سالم و آفتاب‌سوخته خطری ندارند. در هر دو مورد، اسپری (احتمال استنشاق) ایمن در نظر گرفته نشده است. این نتیجه ربطی به تیتانیوم دی‌اکسید خوراکی (E171) ندارد.',
      itemIds: ['sunscreen', 'moisturizer', 'lip-balm'],
      sources: [EU_ZINC_OXIDE, SCCS_TIO2_SPRAY]
    }),
    defineIngredient({
      id: 'fragrance-allergens',
      name: 'عطر و آلرژن‌های عطر (Parfum / Fragrance)',
      aliases: ['عطر', 'پرفیوم', 'Parfum', 'Fragrance', 'لیمونن', 'لینالول', 'سیترال', 'اوژنول', 'کومارین', 'Limonene', 'Linalool', 'Citral', 'Eugenol', 'Coumarin', 'آلرژن', 'حساسیت پوستی'],
      whatIsIt: 'مخلوطی از ترکیبات معطر طبیعی و مصنوعی که در برچسب فقط با واژه‌ی Parfum یا Fragrance می‌آید.',
      role: 'ایجاد بوی خوش در شامپو، کرم، ضدتعریق و عطر.',
      verdict: Verdict.CAUTION,
      verdictNote: 'SCCS ۸۲ ماده را «آلرژن تماسی تثبیت‌شده» در انسان شناخته و ۵۶ ماده‌ی جدید به ۲۶ ماده‌ی قبلی اضافه کرد. اگر غلظت از ۰٫۰۰۱٪ در محصول ماندنی یا ۰٫۰۱٪ در محصول شست‌وشو بیشتر شود، باید جدا در فهرست مواد بیاید. برای پوست حساس یا سابقه‌ی آلرژی، محصول بدون عطر مطمئن‌تر است.',
      itemIds: ['perfume', 'deodorant', 'shampoo', 'body-wash', 'conditioner', 'hair-mask', 'hair-gel', 'moisturizer', 'hand-cream', 'face-wash', 'liquid-soap', 'soap', 'lip-balm', 'wet-wipes', 'shaving-supplies', 'baby-care', 'body-lotion', 'body-spray', 'makeup-remover'],
      sources: [EC_FRAGRANCE, EU_2023_1545]
    })
  ]
})
