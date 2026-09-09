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
          { id: "drinking-water", title: "آب آشامیدنی", note: "" },
          { id: "vermicelli", title: "رشته آش و سوپ", note: "" },
          { id: "breadcrumbs", title: "آرد سوخاری", note: "" },
          { id: "corn-starch", title: "نشاسته ذرت", note: "" },
          { id: "cocoa", title: "پودر کاکائو", note: "" },
          { id: "baking-powder", title: "بیکینگ پودر و جوش شیرین", note: "" },
          { id: "vinegar", title: "سرکه", note: "" },
          { id: "lemon-juice", title: "آبلیمو", note: "" },
          { id: "saffron", title: "زعفران", note: "" },
          { id: "dried-herbs", title: "سبزی خشک", note: "" },
          { id: "nuts", title: "آجیل و مغزها", note: "" },
          { id: "dried-fruit", title: "خشکبار", note: "" }
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
          { id: "seasonal-fruit", title: "میوه فصل", note: "" },
          { id: "peaches", title: "هلو و شلیل", note: "" },
          { id: "grapes", title: "انگور", note: "" },
          { id: "watermelon", title: "هندوانه و خربزه", note: "" },
          { id: "cabbage", title: "کلم", note: "" },
          { id: "celery", title: "کرفس", note: "" },
          { id: "spinach", title: "اسفناج", note: "" },
          { id: "broccoli", title: "کلم بروکلی", note: "" },
          { id: "green-beans", title: "لوبیا سبز", note: "" },
          { id: "peas", title: "نخودفرنگی", note: "" },
          { id: "avocado", title: "آووکادو", note: "" }
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
          { id: "ice-cream", title: "بستنی", note: "" },
          { id: "kefir", title: "کفیر", note: "" },
          { id: "doogh", title: "دوغ", note: "" },
          { id: "cottage-cheese", title: "پنیر خامه‌ای", note: "" },
          { id: "parmesan", title: "پنیر پیتزا و پارمزان", note: "" },
          { id: "turkey", title: "بوقلمون", note: "" },
          { id: "shrimp", title: "میگو", note: "" },
          { id: "minced-meat", title: "گوشت چرخ‌کرده", note: "" },
          { id: "liver", title: "جگر", note: "" },
          { id: "frozen-fries", title: "سیب‌زمینی نیمه‌آماده", note: "" }
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
          { id: "razors", title: "تیغ اصلاح", note: "" },
          { id: "face-wash", title: "شوینده صورت", note: "" },
          { id: "moisturizer", title: "کرم مرطوب‌کننده", note: "" },
          { id: "sunscreen", title: "ضدآفتاب", note: "" },
          { id: "hair-mask", title: "ماسک مو", note: "" },
          { id: "hair-gel", title: "ژل یا حالت‌دهنده مو", note: "" },
          { id: "hand-cream", title: "کرم دست", note: "" },
          { id: "lip-balm", title: "بالم لب", note: "" },
          { id: "perfume", title: "عطر و ادکلن", note: "" },
          { id: "nail-care", title: "لوازم مراقبت ناخن", note: "" }
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
          { id: "insect-spray", title: "حشره‌کش", note: "" },
          { id: "hand-sanitizer", title: "ژل ضدعفونی‌کننده", note: "" },
          { id: "drain-cleaner", title: "لوله‌بازکن", note: "" },
          { id: "washing-machine-cleaner", title: "جرم‌گیر ماشین لباسشویی", note: "" },
          { id: "dishwasher-cleaner", title: "جرم‌گیر ماشین ظرفشویی", note: "" },
          { id: "fabric-stain-remover", title: "لکه‌بر لباس", note: "" },
          { id: "scouring-powder", title: "پودر شوینده سطوح", note: "" },
          { id: "mop-refill", title: "یدک تی", note: "" },
          { id: "dust-cloths", title: "دستمال گردگیری", note: "" },
          { id: "garbage-gloves", title: "دستکش ضخیم نظافت", note: "" }
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
          ,{ id: "baking-paper", title: "کاغذ روغنی", note: "" }
          ,{ id: "wooden-skewers", title: "سیخ چوبی", note: "" }
          ,{ id: "coffee-filters", title: "فیلتر قهوه", note: "" }
          ,{ id: "cake-candles", title: "شمع تولد", note: "مصرف مناسبتی" }
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
  },
  {
    id: "breakfast-drinks",
    version: 1,
    title: "صبحانه و نوشیدنی",
    description: "اقلامی برای صبحانه و نوشیدنی‌های روزانه",
    icon: "☕",
    categories: [
      {
        id: "breakfast-items",
        name: "صبحانه و نوشیدنی",
        icon: "🍯",
        items: [
          { id: "breakfast-bread", title: "نان صبحانه", note: "" },
          { id: "toast-bread", title: "نان تست", note: "" },
          { id: "honey", title: "عسل", note: "" },
          { id: "breakfast-jam", title: "مربا", note: "" },
          { id: "peanut-butter", title: "کره بادام‌زمینی", note: "" },
          { id: "halva", title: "حلواشکری", note: "" },
          { id: "cereal", title: "غلات صبحانه", note: "" },
          { id: "oats", title: "جو دوسر پرک", note: "" },
          { id: "dates", title: "خرما", note: "" },
          { id: "walnuts", title: "گردو", note: "" },
          { id: "black-tea", title: "چای سیاه", note: "" },
          { id: "green-tea", title: "چای سبز و دمنوش", note: "" },
          { id: "instant-coffee", title: "قهوه فوری", note: "" },
          { id: "hot-chocolate", title: "هات‌چاکلت", note: "" },
          { id: "syrup", title: "شربت و پودر نوشیدنی", note: "" }
        ]
      }
    ]
  },
  {
    id: "home-office",
    version: 1,
    title: "لوازم اداری و تحریر",
    description: "اقلام مصرفی برای میز کار و یادداشت‌برداری در خانه",
    icon: "📎",
    categories: [
      {
        id: "stationery",
        name: "نوشت‌افزار",
        icon: "🖊️",
        items: [
          { id: "pens", title: "خودکار و روان‌نویس" },
          { id: "printer-paper", title: "کاغذ A4", note: "برای پرینتر خانگی" },
          { id: "sticky-notes", title: "کاغذ یادداشت چسب‌دار" },
          { id: "highlighters", title: "ماژیک هایلایت" },
          { id: "paper-clips", title: "گیره کاغذ و پونز" }
        ]
      }
    ]
  }
]
