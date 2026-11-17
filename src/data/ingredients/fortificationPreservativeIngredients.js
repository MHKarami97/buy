import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var WHO_FLOUR = source('WHO: Fortification of wheat flour', 'https://www.who.int/tools/elena/bbc/wheat-flour-fortification')
var EFSA_BENZOATE = source('EFSA Journal 2016: Re-evaluation of benzoic acid (E 210) and benzoates (E 211-213)', 'https://efsa.onlinelibrary.wiley.com/doi/pdf/10.2903/j.efsa.2016.4433')
var EU_SORBATE = source('EU Regulation 2020/268 (sorbic acid E 200 and potassium sorbate E 202, group ADI)', 'https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32020R0268')

export var fortificationPreservativeGroup = defineIngredientGroup({
  id: 'fortification-preservatives',
  name: 'مکمل‌ها و نگهدارنده‌ها',
  icon: '🧪',
  ingredients: [
    defineIngredient({
      id: 'folic-acid',
      name: 'اسید فولیک',
      aliases: ['فولیک اسید', 'فولات', 'ویتامین B9', 'Folic Acid', 'Folate', 'غنی‌شده با اسید فولیک'],
      whatIsIt: 'شکل صناعی ویتامین B9 که برای غنی‌سازی آرد و غلات به کار می‌رود.',
      role: 'غنی‌سازی مواد غذایی پایه؛ طبق WHO، غنی‌سازی با اسید فولیک در چند کشور از جمله ایران موارد نقص لوله عصبی را به‌طور قابل‌توجهی کاهش داده است.',
      verdict: Verdict.GOOD,
      verdictNote: 'وجود آن در آرد و فرآورده‌های آرد معمولاً نکته مثبت است. مصرف دوز بالای مکمل باید با نظر پزشک باشد؛ این صفحه توصیه پزشکی نیست.',
      itemIds: ['flour', 'bread', 'breakfast-bread', 'toast-bread', 'pasta', 'cereal', 'cake-powder', 'pancake-powder', 'breadcrumbs', 'lasagna', 'vermicelli', 'noodles', 'biscuits-cookies'],
      sources: [WHO_FLOUR]
    }),
    defineIngredient({
      id: 'sodium-benzoate',
      name: 'بنزوات سدیم (E211)',
      aliases: ['بنزوات سدیم', 'E211', 'Sodium Benzoate', 'سدیم بنزوات', 'نگهدارنده'],
      whatIsIt: 'نگهدارنده شیمیایی که رشد کپک و مخمر و بخشی از باکتری‌ها را در غذاهای اسیدی مهار می‌کند.',
      role: 'افزایش ماندگاری نوشیدنی، سس و ترشی.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'EFSA در بازبینی ۲۰۱۶ نگرانی ژنوتوکسیسیتی نیافت و ADI گروهی بنزوات‌ها ۵ میلی‌گرم بر کیلوگرم وزن بدن است. مشکل مصرف زیاد محصولات دارای آن (نوشابه و سس) است، نه یک بسته مجزا.',
      itemIds: ['soft-drink', 'malt-drink', 'syrup', 'sauce', 'mayonnaise-sauce', 'pickles', 'jam', 'breakfast-jam', 'lavashak', 'salad-seasoning', 'chocolate-sauce', 'energy-drink', 'fruit-juice'],
      sources: [EFSA_BENZOATE]
    }),
    defineIngredient({
      id: 'potassium-sorbate',
      name: 'سوربات پتاسیم (E202)',
      aliases: ['سوربات', 'سورباتِ پتاسیم', 'E202', 'Potassium Sorbate', 'اسید سوربیک', 'E200'],
      whatIsIt: 'نمک پتاسیم اسید سوربیک؛ نگهدارنده‌ای برای جلوگیری از کپک و مخمر.',
      role: 'ماندگاری پنیر، مربا، سس و محصولات نانوایی.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'EFSA برای اسید سوربیک و سوربات پتاسیم ADI گروهی ۱۱ میلی‌گرم (بر پایه اسید سوربیک) بر کیلوگرم وزن بدن تعیین کرده و مصرف در موارد مجاز را نگران‌کننده نمی‌داند. یک منبع غیررسمی عدد دیگری هم نوشته که تأیید نشد؛ عدد رسمی بالا را ملاک بگیرید.',
      itemIds: ['cheese', 'cottage-cheese', 'jam', 'breakfast-jam', 'sauce', 'mayonnaise-sauce', 'olives', 'pickles', 'dry-pastry', 'toast-bread', 'syrup', 'chocolate-spread', 'fruit-juice', 'biscuits-cookies'],
      sources: [EU_SORBATE]
    })
  ]
})
