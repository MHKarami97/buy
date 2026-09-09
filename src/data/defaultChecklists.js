export var defaultChecklistDefinitions = [
  {
    id: "staples",
    version: 1,
    title: "مواد غذایی پایه",
    description: "اقلام خشک و مصرفی که معمولاً هر ماه خریداری می‌شوند",
    icon: "🛒",
    categories: [
      {
        id: "staples-food",
        name: "مواد غذایی پایه",
        icon: "🌾",
        items: [
          { id: "rice", title: "برنج", note: "خرید ماهانه" },
          { id: "bread", title: "نان", note: "خرید روزانه یا هفتگی" },
          { id: "pasta", title: "ماکارونی", note: "" },
          { id: "flour", title: "آرد", note: "" },
          { id: "sugar", title: "شکر", note: "" },
          { id: "salt", title: "نمک", note: "" },
          { id: "tea", title: "چای", note: "" },
          { id: "coffee", title: "قهوه", note: "" },
          { id: "cooking-oil", title: "روغن خوراکی", note: "" },
          { id: "tomato-paste", title: "رب گوجه‌فرنگی", note: "" },
          { id: "spices", title: "ادویه و چاشنی", note: "" },
          { id: "beans", title: "حبوبات", note: "عدس، نخود و لوبیا" },
          { id: "canned-food", title: "کنسرو و غذای آماده", note: "" },
          { id: "pickles", title: "ترشی و خیارشور", note: "" },
          { id: "jam", title: "مربا و عسل", note: "" },
          { id: "snacks", title: "تنقلات", note: "" },
          { id: "drinking-water", title: "آب آشامیدنی", note: "" }
        ]
      }
    ]
  },
  {
    id: "produce",
    version: 1,
    title: "میوه و سبزیجات",
    description: "خرید تازه روزانه یا هفتگی خانه",
    icon: "🍎",
    categories: [
      {
        id: "fresh-produce",
        name: "میوه و سبزیجات تازه",
        icon: "🥬",
        items: [
          { id: "apples", title: "سیب", note: "" },
          { id: "bananas", title: "موز", note: "" },
          { id: "oranges", title: "پرتقال و نارنگی", note: "" },
          { id: "lemons", title: "لیموترش", note: "" },
          { id: "cucumbers", title: "خیار", note: "" },
          { id: "tomatoes", title: "گوجه‌فرنگی", note: "" },
          { id: "potatoes", title: "سیب‌زمینی", note: "" },
          { id: "onions", title: "پیاز", note: "" },
          { id: "garlic", title: "سیر", note: "" },
          { id: "lettuce", title: "کاهو", note: "" },
          { id: "herbs", title: "سبزی خوردن", note: "" },
          { id: "carrots", title: "هویج", note: "" },
          { id: "bell-peppers", title: "فلفل دلمه‌ای", note: "" },
          { id: "eggplant", title: "بادمجان", note: "" },
          { id: "zucchini", title: "کدو", note: "" },
          { id: "mushrooms", title: "قارچ", note: "" },
          { id: "seasonal-fruit", title: "میوه فصل", note: "" }
        ]
      }
    ]
  },
  {
    id: "dairy-protein",
    version: 1,
    title: "لبنیات و پروتئین",
    description: "مواد تازه و مصرفی یخچال",
    icon: "🥛",
    categories: [
      {
        id: "fresh-food",
        name: "لبنیات و مواد تازه",
        icon: "🧀",
        items: [
          { id: "milk", title: "شیر", note: "خرید هفتگی" },
          { id: "yogurt", title: "ماست", note: "" },
          { id: "cheese", title: "پنیر", note: "" },
          { id: "butter", title: "کره", note: "" },
          { id: "cream", title: "خامه", note: "" },
          { id: "eggs", title: "تخم‌مرغ", note: "" },
          { id: "chicken", title: "مرغ", note: "" },
          { id: "red-meat", title: "گوشت قرمز", note: "" },
          { id: "fish", title: "ماهی", note: "" },
          { id: "sausage", title: "سوسیس و کالباس", note: "" },
          { id: "frozen-vegetables", title: "سبزیجات منجمد", note: "" },
          { id: "ice-cream", title: "بستنی", note: "" }
        ]
      }
    ]
  },
  {
    id: "personal-care",
    version: 1,
    title: "بهداشت شخصی",
    description: "اقلام مصرفی بهداشت و مراقبت روزانه",
    icon: "🧴",
    categories: [
      {
        id: "personal-hygiene",
        name: "بهداشت و مراقبت شخصی",
        icon: "🧼",
        items: [
          { id: "soap", title: "صابون", note: "" },
          { id: "shampoo", title: "شامپو", note: "" },
          { id: "body-wash", title: "شامپو بدن", note: "" },
          { id: "conditioner", title: "نرم‌کننده مو", note: "" },
          { id: "toothbrush", title: "مسواک", note: "" },
          { id: "toothpaste", title: "خمیردندان", note: "" },
          { id: "dental-floss", title: "نخ دندان", note: "" },
          { id: "mouthwash", title: "دهان‌شویه", note: "" },
          { id: "toilet-paper", title: "دستمال توالت", note: "" },
          { id: "tissues", title: "دستمال کاغذی", note: "" },
          { id: "wet-wipes", title: "دستمال مرطوب", note: "" },
          { id: "liquid-soap", title: "مایع دستشویی", note: "" },
          { id: "deodorant", title: "ضدتعریق", note: "" },
          { id: "shaving-supplies", title: "لوازم اصلاح", note: "" },
          { id: "cotton-swabs", title: "گوش‌پاک‌کن", note: "" },
          { id: "cotton-pads", title: "پد بهداشتی", note: "" },
          { id: "sanitary-products", title: "محصولات بهداشت بانوان", note: "" },
          { id: "razors", title: "تیغ اصلاح", note: "" }
        ]
      }
    ]
  },
  {
    id: "cleaning-supplies",
    version: 1,
    title: "شوینده و نظافت",
    description: "مواد مصرفی نظافت خانه و لباس",
    icon: "🧽",
    categories: [
      {
        id: "cleaning-consumables",
        name: "مواد شوینده و نظافت",
        icon: "🫧",
        items: [
          { id: "dishwashing-liquid", title: "مایع ظرفشویی", note: "" },
          { id: "dishwasher-tablets", title: "قرص ماشین ظرفشویی", note: "" },
          { id: "laundry-detergent", title: "پودر یا مایع لباسشویی", note: "" },
          { id: "softener", title: "نرم‌کننده لباس", note: "" },
          { id: "bleach", title: "سفیدکننده", note: "" },
          { id: "floor-cleaner", title: "مایع زمین‌شوی", note: "" },
          { id: "multi-purpose-cleaner", title: "پاک‌کننده چندمنظوره", note: "" },
          { id: "glass-cleaner", title: "شیشه‌پاک‌کن", note: "" },
          { id: "toilet-cleaner", title: "شوینده سرویس بهداشتی", note: "" },
          { id: "descaler", title: "جرم‌گیر", note: "" },
          { id: "sponge", title: "اسکاچ و اسفنج", note: "" },
          { id: "steel-wool", title: "سیم ظرفشویی", note: "" },
          { id: "cleaning-cloths", title: "دستمال نظافت", note: "" },
          { id: "rubber-gloves", title: "دستکش نظافت", note: "" },
          { id: "trash-bags", title: "کیسه زباله", note: "" },
          { id: "air-freshener", title: "خوشبوکننده هوا", note: "" },
          { id: "insect-spray", title: "حشره‌کش", note: "" }
        ]
      }
    ]
  },
  {
    id: "kitchen-consumables",
    version: 1,
    title: "مصرفی آشپزخانه",
    description: "اقلامی که برای نگهداری و مصرف روزانه غذا تمام می‌شوند",
    icon: "🍽️",
    categories: [
      {
        id: "kitchen-disposables",
        name: "مصرفی‌های آشپزخانه",
        icon: "🧻",
        items: [
          { id: "paper-towels", title: "حوله کاغذی", note: "" },
          { id: "aluminum-foil", title: "فویل آلومینیومی", note: "" },
          { id: "plastic-wrap", title: "سلفون", note: "" },
          { id: "zipper-bags", title: "کیسه زیپ‌دار", note: "" },
          { id: "freezer-bags", title: "کیسه فریزر", note: "" },
          { id: "food-storage-bags", title: "کیسه نگهداری غذا", note: "" },
          { id: "disposable-gloves", title: "دستکش یک‌بارمصرف", note: "" },
          { id: "disposable-cups", title: "لیوان یک‌بارمصرف", note: "" },
          { id: "disposable-plates", title: "ظرف یک‌بارمصرف", note: "" },
          { id: "straws", title: "نی", note: "" },
          { id: "toothpicks", title: "خلال دندان", note: "" },
          { id: "napkins", title: "دستمال سفره", note: "" },
          { id: "charcoal", title: "زغال", note: "مصرف مناسبتی" },
          { id: "matches", title: "کبریت و فندک", note: "" }
        ]
      }
    ]
  },
  {
    id: "home-consumables",
    version: 1,
    title: "مصرفی خانه",
    description: "اقلام کوچک و مصرفی برای استفاده روزمره خانه",
    icon: "🏠",
    categories: [
      {
        id: "daily-home-consumables",
        name: "مصرفی‌های خانه",
        icon: "🧺",
        items: [
          { id: "laundry-bag", title: "کیسه لباسشویی", note: "" },
          { id: "sewing-thread", title: "نخ خیاطی", note: "" },
          { id: "sewing-needles", title: "سوزن", note: "" },
          { id: "batteries", title: "باتری قلمی", note: "در صورت نیاز" },
          { id: "light-bulbs", title: "لامپ یدک", note: "در صورت سوختن" },
          { id: "adhesive-tape", title: "چسب نواری", note: "" },
          { id: "super-glue", title: "چسب قطره‌ای", note: "" },
          { id: "shoe-polish", title: "واکس کفش", note: "" },
          { id: "plant-soil", title: "خاک و کود گیاه", note: "در صورت داشتن گیاه" },
          { id: "pet-food", title: "غذای حیوان خانگی", note: "در صورت نیاز" },
          { id: "pet-litter", title: "خاک گربه", note: "در صورت نیاز" },
          { id: "first-aid-refill", title: "اقلام مصرفی کمک‌های اولیه", note: "چسب زخم و باند" }
        ]
      }
    ]
  }
]
