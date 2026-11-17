import { Verdict, defineIngredient, defineIngredientGroup, source } from './ingredientBuilder'

var WA_BLEACH = source('Washington State Department of Health: Dangers of mixing bleach with cleaners', 'https://doh.wa.gov/community-and-environment/contaminants/bleach-mixing-dangers')
var MEDLINE_BLEACH = source('MedlinePlus: Sodium hypochlorite poisoning', 'https://medlineplus.gov/ency/article/002488.htm')
var POISON_BLEACH = source('National Capital Poison Center: Chlorine gas, mixing bleach and other cleaners', 'https://www.poison.org/articles/chlorine-gas')
var QAC_ASTHMA = source('PubMed: Quaternary ammonium compounds and occupational asthma', 'https://pubmed.ncbi.nlm.nih.gov/11007347/')
var QAC_MOUNT_SINAI = source('Mount Sinai: Quaternary ammonium compounds in cleaning products', 'https://www.mountsinai.org/files/MSHealth/Assets/HS/Patient-Care/Service-Areas/Occupational-Medicine/QACsInfoforWorkers_18.pdf')
var AISE_ENZYMES = source('A.I.S.E./AMFEP: Role and importance of enzymes in cleaning and hygiene', 'https://www.detergentseurope.eu/wp-content/uploads/2026/05/role-and-importance-of-enzymes-in-cleaning-and-disinfection-aise-amfep.pdf')
var EU_DETERGENTS = source('Regulation (EU) 2026/405 on detergents and surfactants', 'https://eur-lex.europa.eu/eli/reg/2026/405/oj/eng')

export var cleaningIngredientsGroup = defineIngredientGroup({
  id: 'cleaning-ingredients',
  name: 'مواد فعال شوینده و ضدعفونی',
  icon: '🧽',
  ingredients: [
    defineIngredient({
      id: 'sodium-hypochlorite',
      name: 'هیپوکلریت سدیم (مایع سفیدکننده / وایتکس)',
      aliases: ['هیپوکلریت سدیم', 'وایتکس', 'مایع سفیدکننده', 'ماده سفیدکننده', 'کلر', 'Sodium Hypochlorite', 'Bleach', 'Chlorine Bleach'],
      whatIsIt: 'ماده‌ی فعال سفیدکننده و ضدعفونی‌کننده‌ی کلردار که خورنده است.',
      role: 'سفید کردن و ضدعفونی سطوح و لباس.',
      verdict: Verdict.CAUTION,
      verdictNote: 'ترکیب آن با آمونیاک گاز سمی کلرآمین تولید می‌کند و با اسیدها و لوله‌بازکن‌ها نیز واکنش می‌دهد. هرگز آن را با شوینده‌ی دیگر مخلوط نکنید. بلعیدن یا استنشاق بخار ممکن است مسمومیت ایجاد کند. با دستکش و تهویه استفاده کنید.',
      itemIds: ['bleach', 'toilet-cleaner', 'multi-purpose-cleaner', 'floor-cleaner', 'drain-cleaner', 'fabric-stain-remover', 'washing-machine-cleaner', 'dishwasher-cleaner', 'glass-cleaner', 'scouring-powder'],
      sources: [WA_BLEACH, MEDLINE_BLEACH, POISON_BLEACH]
    }),
    defineIngredient({
      id: 'quaternary-ammonium',
      name: 'ترکیبات آمونیوم چهارتایی (بنزالکونیوم کلرید و مشابه)',
      aliases: ['بنزالکونیوم کلرید', 'آمونیوم چهارتایی', 'کواترنری', 'QAC', 'Quats', 'Benzalkonium Chloride', 'BAC', 'ضدعفونی‌کننده', 'ضدباکتری'],
      whatIsIt: 'گروهی از ضدعفونی‌کننده‌ها و ضدباکتری‌ها که با آمونیاک متفاوت‌اند.',
      role: 'ضدعفونی سطوح، دستمال مرطوب و برخی شوینده‌ها و ضدعفونی‌کننده‌ی دست.',
      verdict: Verdict.CAUTION,
      verdictNote: 'ممکن است پوست و چشم را تحریک کنند و در برخی افراد، به‌ویژه مبتلایان به آسم، علائم تنفسی بدهند. موارد آسم شغلی در پرستاران گزارش شده است (نادر). با سفیدکننده مخلوط نکنید. اسپری‌نکردن و تهویه ریسک را کم می‌کند.',
      itemIds: ['multi-purpose-cleaner', 'floor-cleaner', 'toilet-cleaner', 'hand-sanitizer', 'wet-wipes', 'air-freshener', 'insect-spray', 'cleaning-cloths', 'rubbing-alcohol'],
      sources: [QAC_ASTHMA, QAC_MOUNT_SINAI]
    }),
    defineIngredient({
      id: 'detergent-enzymes',
      name: 'آنزیم‌های شوینده (پروتئاز، آمیلاز، لیپاز، سلولاز)',
      aliases: ['آنزیم', 'پروتئاز', 'آمیلاز', 'لیپاز', 'سلولاز', 'Enzymes', 'Protease', 'Amylase', 'Lipase', 'Cellulase', 'لکه‌بر زیستی'],
      whatIsIt: 'پروتئین‌هایی که لکه‌های پروتئینی، نشاسته‌ای و چربی را تجزیه می‌کنند.',
      role: 'پاک‌کنندگی بهتر لکه در آب سرد در پودر و مایع لباسشویی و ظرفشویی.',
      verdict: Verdict.NEUTRAL,
      verdictNote: 'به گفته‌ی اتحادیه‌ی صنعت (A.I.S.E.)، در مصرف خانگی ایمن‌اند، ولی مثل هر پروتئینی ممکن است حساسیت تنفسی ایجاد کنند. گرد پودر را استنشاق نکنید. این منبع صنعتی است و مستقل نیست.',
      itemIds: ['laundry-detergent', 'dishwasher-tablets', 'fabric-stain-remover', 'dishwashing-liquid', 'washing-machine-cleaner', 'carpet-shampoo'],
      sources: [AISE_ENZYMES]
    }),
    defineIngredient({
      id: 'phosphates-detergents',
      name: 'فسفات‌ها در شوینده‌ها',
      aliases: ['فسفات', 'پلی‌فسفات', 'تری‌پلی‌فسفات', 'ترکیبات فسفری', 'Phosphates', 'Phosphorus', 'STPP'],
      whatIsIt: 'نمک‌های فسفر که سختی آب را می‌گیرند و کارایی شوینده را بالا می‌برند.',
      role: 'نرم‌کردن آب و کمک به پاک‌کنندگی در پودر لباسشویی و قرص ماشین ظرفشویی.',
      verdict: Verdict.CAUTION,
      verdictNote: 'مشکل اصلی محیط‌زیستی است: فسفات در آب‌های طبیعی باعث یوتروفیکاسیون می‌شود. مقررات اتحادیه اروپا برای شوینده‌ی لباسشویی خانگی حد فسفر را کمتر از ۰٫۵ گرم در مقدار توصیه‌شده برای یک بار شست‌وشو گذاشته است. این حد محدودیت اروپاست و در ایران ممکن است فرق کند.',
      itemIds: ['laundry-detergent', 'dishwasher-tablets', 'softener', 'descaler', 'washing-machine-cleaner', 'dishwasher-salt'],
      sources: [EU_DETERGENTS]
    })
  ]
})
