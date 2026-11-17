export var defaultChecklistDefinitions = [
  {
    id: "staples",
    version: 4,
    title: "مواد غذایی پایه",
    description: "اقلام خشک و مصرفی که معمولاً هر ماه خریداری می‌شوند",
    icon: "🛒",
    categories: [
      {
        id: "staples-grains",
        name: "غلات، نان و ماکارونی",
        icon: "🌾",
        items: [
          { id: "rice", title: "برنج", note: "خرید ماهانه", isEssential: true },
          { id: "bread", title: "نان", note: "خرید روزانه یا هفتگی", isEssential: true },
          { id: "pasta", title: "ماکارونی", note: "", isEssential: true },
          { id: "flour", title: "آرد", note: "", isEssential: true },
          { id: "soy-protein", title: "سویای خوراکی", note: "برای ماکارونی و خورش", isEssential: true },
          { id: "noodles", title: "نودل فوری", note: "", isEssential: false },
          { id: "pizza-dough", title: "خمیر پیتزا", note: "", isEssential: false },
          { id: "lasagna", title: "لازانیا", note: "", isEssential: false },
          { id: "rice-noodles", title: "رشته پلویی", note: "", isEssential: false },
          { id: "vermicelli", title: "رشته آش و سوپ", note: "", isEssential: false }
        ]
      },
      {
        id: "staples-legumes",
        name: "حبوبات",
        icon: "🫘",
        items: [
          { id: "beans", title: "حبوبات", note: "عدس، نخود و لوبیا", isEssential: true },
          { id: "corn", title: "ذرت", note: "", isEssential: false },
          { id: "broad-beans", title: "باقالی", note: "", isEssential: false },
          { id: "okra", title: "بامیه", note: "", isEssential: false }
        ]
      },
      {
        id: "staples-oils-seasoning",
        name: "روغن، ادویه و چاشنی",
        icon: "🧂",
        items: [
          { id: "cooking-oil", title: "روغن سرخ‌کردنی", note: "", isEssential: true },
          { id: "cooking-oil-rice", title: "روغن پخت‌پز", note: "", isEssential: true },
          { id: "salt", title: "نمک", note: "", isEssential: true },
          { id: "sugar", title: "شکر", note: "", isEssential: true },
          { id: "sugar-cubes", title: "قند", note: "شکسته یا کله‌قند", isEssential: true },
          { id: "spices", title: "ادویه و چاشنی", note: "", isEssential: true },
          { id: "tomato-paste", title: "رب گوجه‌فرنگی", note: "", isEssential: true },
          { id: "abghooreh", title: "آبغوره", note: "", isEssential: true },
          { id: "lemon-juice", title: "آبلیمو", note: "", isEssential: true },
          { id: "tea", title: "چای", note: "", isEssential: true },
          { id: "cooking-oil-zitun", title: "روغن زیتون", note: "", isEssential: false },
          { id: "coffee", title: "قهوه", note: "", isEssential: false },
          { id: "vinegar", title: "سرکه", note: "", isEssential: false },
          { id: "saffron", title: "زعفران", note: "", isEssential: false },
          { id: "salad-seasoning", title: "چاشنی سالاد", note: "", isEssential: false },
          { id: "mint-distillate", title: "عرق نعنا", note: "", isEssential: false },
          { id: "lime-dried", title: "لیمو عمانی", note: "", isEssential: false },
          { id: "dried-herbs", title: "سبزی خشک", note: "", isEssential: false },
          { id: "sesame", title: "کنجد", note: "", isEssential: false },
          { id: "rosewater", title: "گلاب", note: "", isEssential: false },
          { id: "rock-candy", title: "نبات", note: "", isEssential: false }
        ]
      },
      {
        id: "staples-canned",
        name: "کنسرو و غذاهای آماده",
        icon: "🥫",
        items: [
          { id: "canned-tuna", title: "تن ماهی", note: "روغنی یا رژیمی", isEssential: true },
          { id: "pickles", title: "ترشی و خیارشور", note: "", isEssential: true },
          { id: "sauce", title: "سس", note: "", isEssential: true },
          { id: "mayonnaise-sauce", title: "سس مایومز", note: "", isEssential: true },
          { id: "canned-food", title: "کنسرو و غذای آماده", note: "", isEssential: false },
          { id: "olives", title: "زیتون", note: "", isEssential: false },
          { id: "fried-onions", title: "پیاز سرخ کرده", note: "", isEssential: false },
          { id: "kashk", title: "کشک", note: "", isEssential: false },
          { id: "soup-powder", title: "سوپ آماده و عصاره", note: "عصاره مرغ یا گوشت و سوپ نیمه‌آماده", isEssential: false },
          { id: "compote", title: "کمپوت", note: "آناناس، گیلاس یا هلو", isEssential: false }
        ]
      },
      {
        id: "staples-snacks-baking",
        name: "تنقلات، شیرینی و کیک‌پزی",
        icon: "🍿",
        items: [
          { id: "biscuits-cookies", title: "بیسکویت و کلوچه", note: "ساده، کرم‌دار یا ویفر", isEssential: true },
          { id: "chips", title: "چیپس", note: "ساده، خلال یا طعم‌دار", isEssential: false },
          { id: "puffs-snacks", title: "پفک و اسنک", note: "", isEssential: false },
          { id: "gummies-candy", title: "پاستیل و دراژه", note: "", isEssential: false },
          { id: "hard-candy", title: "آبنبات و تافی", note: "", isEssential: false },
          { id: "chocolate", title: "شکلات", note: "", isEssential: false },
          { id: "chocolate-sauce", title: "سس کاکائو", note: "", isEssential: false },
          { id: "lavashak", title: "لواشک", note: "", isEssential: false },
          { id: "snacks", title: "تنقلات", note: "", isEssential: false },
          { id: "popcorn", title: "پفیلا", note: "", isEssential: false },
          { id: "dry-pastry", title: "شیرینی خشک", note: "", isEssential: false },
          { id: "cake-powder", title: "پودر کیک", note: "", isEssential: false },
          { id: "pancake-powder", title: "پودر پنکیک", note: "", isEssential: false },
          { id: "jelly-powder", title: "ژله", note: "", isEssential: false },
          { id: "jam", title: "مربا و عسل", note: "", isEssential: false },
          { id: "cocoa", title: "پودر کاکائو", note: "", isEssential: false },
          { id: "vanilla", title: "وانیل", note: "برای کیک و شیرینی‌پزی", isEssential: false },
          { id: "baking-powder", title: "بیکینگ پودر و جوش شیرین", note: "", isEssential: false },
          { id: "breadcrumbs", title: "آرد سوخاری", note: "", isEssential: false },
          { id: "corn-starch", title: "نشاسته ذرت", note: "", isEssential: false }
        ]
      },
      {
        id: "staples-nuts",
        name: "آجیل و مغزها",
        icon: "🥜",
        items: [
          { id: "nuts", title: "آجیل و مغزها", note: "", isEssential: false },
          { id: "seeds", title: "تخمه", note: "", isEssential: false },
          { id: "raisins", title: "کشمش و مویز", note: "پلویی یا آجیلی", isEssential: false },
          { id: "almond-slivers", title: "خلال بادام", note: "", isEssential: false },
          { id: "pistachio-slivers", title: "خلال پسته", note: "", isEssential: false },
          { id: "khashir", title: "خاکشیر", note: "", isEssential: false },
          { id: "basil-seeds", title: "تخم شربتی", note: "", isEssential: false },
          { id: "guest-snacks", title: "تنقلات پذیرایی مهمان", note: "", isEssential: false },
          { id: "drinking-water", title: "آب آشامیدنی", note: "", isEssential: false }
        ]
      }
    ]
  },
  {
    id: "produce",
    version: 3,
    title: "میوه و سبزیجات",
    description: "خرید تازه روزانه یا هفتگی خانه",
    icon: "🍎",
    categories: [
      {
        id: "fresh-produce",
        name: "میوه و سبزیجات تازه",
        icon: "🥬",
        items: [
          { id: "apples", title: "سیب", note: "", isEssential: true },
          { id: "bananas", title: "موز", note: "", isEssential: true },
          { id: "oranges", title: "پرتقال و نارنگی", note: "", isEssential: true },
          { id: "lemons", title: "لیموترش", note: "", isEssential: true },
          { id: "cucumbers", title: "خیار", note: "", isEssential: true },
          { id: "tomatoes", title: "گوجه‌فرنگی", note: "", isEssential: true },
          { id: "potatoes", title: "سیب‌زمینی", note: "", isEssential: true },
          { id: "onions", title: "پیاز", note: "", isEssential: true },
          { id: "garlic", title: "سیر", note: "", isEssential: true },
          { id: "lettuce", title: "کاهو", note: "", isEssential: true },
          { id: "herbs", title: "سبزی خوردن", note: "", isEssential: true },
          { id: "carrots", title: "هویج", note: "", isEssential: true },
          { id: "figs", title: "انجیر", note: "", isEssential: false },
          { id: "pears", title: "گلابی", note: "", isEssential: false },
          { id: "nectarines", title: "شلیل", note: "", isEssential: false },
          { id: "plums", title: "آلو", note: "", isEssential: false },
          { id: "cherries", title: "گیلاس", note: "", isEssential: false },
          { id: "bell-peppers", title: "فلفل دلمه‌ای", note: "", isEssential: false },
          { id: "eggplant", title: "بادمجان", note: "", isEssential: false },
          { id: "zucchini", title: "کدو", note: "", isEssential: false },
          { id: "mushrooms", title: "قارچ", note: "", isEssential: false },
          { id: "peaches", title: "هلو و شلیل", note: "", isEssential: false },
          { id: "grapes", title: "انگور", note: "", isEssential: false },
          { id: "watermelon", title: "هندوانه", note: "", isEssential: false },
          { id: "cantaloupe", title: "خربزه", note: "", isEssential: false },
          { id: "tahini", title: "طالبی", note: "", isEssential: false },
          { id: "cabbage", title: "کلم", note: "", isEssential: false },
          { id: "celery", title: "کرفس", note: "", isEssential: false },
          { id: "spinach", title: "اسفناج", note: "", isEssential: false },
          { id: "broccoli", title: "کلم بروکلی", note: "", isEssential: false },
          { id: "green-beans", title: "لوبیا سبز", note: "", isEssential: false },
          { id: "peas", title: "نخودفرنگی", note: "", isEssential: false },
          { id: "avocado", title: "آووکادو", note: "", isEssential: false }
        ]
      }
    ]
  },
  {
    id: "dairy-protein",
    version: 4,
    title: "لبنیات و پروتئین",
    description: "مواد تازه و مصرفی یخچال",
    icon: "🥛",
    categories: [
      {
        id: "dairy-products",
        name: "لبنیات",
        icon: "🧀",
        items: [
          { id: "milk", title: "شیر", note: "خرید هفتگی", isEssential: true },
          { id: "yogurt", title: "ماست", note: "", isEssential: true },
          { id: "cheese", title: "پنیر", note: "", isEssential: true },
          { id: "butter", title: "کره", note: "", isEssential: true },
          { id: "cream", title: "خامه", note: "", isEssential: true },
          { id: "doogh", title: "دوغ", note: "", isEssential: false },
          { id: "cottage-cheese", title: "پنیر خامه‌ای", note: "", isEssential: false },
          { id: "parmesan", title: "پنیر پیتزا و پارمزان", note: "", isEssential: false },
          { id: "ice-cream", title: "بستنی", note: "", isEssential: false }
        ]
      },
      {
        id: "protein-fresh",
        name: "گوشت، مرغ و پروتئین تازه",
        icon: "🥩",
        items: [
          { id: "eggs", title: "تخم‌مرغ", note: "", isEssential: true },
          { id: "chicken", title: "مرغ", note: "", isEssential: true },
          { id: "red-meat", title: "گوشت قرمز", note: "", isEssential: true },
          { id: "minced-meat", title: "گوشت چرخ‌کرده", note: "", isEssential: true },
          { id: "fish", title: "ماهی", note: "", isEssential: false },
          { id: "turkey", title: "بوقلمون", note: "", isEssential: false },
          { id: "shrimp", title: "میگو", note: "", isEssential: false },
          { id: "liver", title: "جگر", note: "", isEssential: false }
        ]
      },
      {
        id: "protein-frozen-ready",
        name: "فرآورده‌ها و غذاهای منجمد",
        icon: "🌭",
        items: [
          { id: "sausage", title: "سوسیس و کالباس", note: "", isEssential: false },
          { id: "frozen-fries", title: "سیب‌زمینی نیمه‌آماده", note: "", isEssential: false },
          { id: "nuggets", title: "ناگت", note: "", isEssential: false },
          { id: "falafel", title: "فلافل", note: "", isEssential: false },
          { id: "burger", title: "همبرگر", note: "آماده و منجمد", isEssential: false },
          { id: "schnitzel", title: "شنیسل و فیله سوخاری", note: "منجمد و نیمه‌آماده", isEssential: false },
          { id: "frozen-koko", title: "سبزی کوکو", note: "", isEssential: false },
          { id: "frozen-ghorme", title: "سبزی قرمه", note: "", isEssential: false },
          { id: "frozen-esfenaj", title: "اسفناج", note: "", isEssential: false }
        ]
      }
    ]
  },
  {
    id: "personal-care",
    version: 4,
    title: "بهداشت شخصی",
    description: "اقلام مصرفی بهداشت و مراقبت روزانه",
    icon: "🧴",
    categories: [
      {
        id: "personal-hygiene",
        name: "بهداشت و مراقبت شخصی",
        icon: "🧼",
        items: [
          { id: "soap", title: "صابون", note: "", isEssential: true },
          { id: "shampoo", title: "شامپو", note: "", isEssential: true },
          { id: "toothbrush", title: "مسواک", note: "", isEssential: true },
          { id: "toothpaste", title: "خمیردندان", note: "", isEssential: true },
          { id: "dental-floss", title: "نخ دندان", note: "", isEssential: true },
          { id: "toilet-paper", title: "دستمال توالت", note: "", isEssential: true },
          { id: "tissues", title: "دستمال کاغذی", note: "", isEssential: true },
          { id: "liquid-soap", title: "مایع دستشویی", note: "", isEssential: true },
          { id: "deodorant", title: "ضدتعریق", note: "", isEssential: true },
          { id: "shaving-supplies", title: "لوازم اصلاح", note: "", isEssential: true },
          { id: "razors", title: "تیغ اصلاح", note: "", isEssential: true },
          { id: "body-wash", title: "شامپو بدن", note: "", isEssential: false },
          { id: "conditioner", title: "نرم‌کننده مو", note: "", isEssential: false },
          { id: "mouthwash", title: "دهان‌شویه", note: "", isEssential: false },
          { id: "wet-wipes", title: "دستمال مرطوب", note: "", isEssential: false },
          { id: "cotton-swabs", title: "گوش‌پاک‌کن", note: "", isEssential: false },
          { id: "cotton-pads", title: "پد بهداشتی", note: "", isEssential: false },
          { id: "face-wash", title: "شوینده صورت", note: "", isEssential: false },
          { id: "moisturizer", title: "کرم مرطوب‌کننده", note: "", isEssential: false },
          { id: "sunscreen", title: "ضدآفتاب", note: "", isEssential: false },
          { id: "hair-mask", title: "ماسک مو", note: "", isEssential: false },
          { id: "hair-gel", title: "ژل یا حالت‌دهنده مو", note: "", isEssential: false },
          { id: "hand-cream", title: "کرم دست", note: "", isEssential: false },
          { id: "lip-balm", title: "بالم لب", note: "", isEssential: false },
          { id: "perfume", title: "عطر و ادکلن", note: "", isEssential: false },
          { id: "nail-care", title: "لوازم مراقبت ناخن", note: "", isEssential: false },
          { id: "baby-care", title: "شامپو و لوسیون کودک", note: "ضد سوزش چشم و ملایم", isEssential: false },
          { id: "body-lotion", title: "لوسیون بدن", note: "مرطوب‌کننده بعد از حمام", isEssential: false },
          { id: "body-spray", title: "بادی اسپلش و اسپری بدن", note: "خوشبوکننده بدن", isEssential: false },
          { id: "makeup-remover", title: "میسلار واتر و پاک‌کننده آرایش", note: "محلول یا شیرپاک‌کن", isEssential: false },
          { id: "cotton-wool", title: "پنبه بهداشتی", note: "توپی یا رولی", isEssential: false },
          { id: "bath-sponge", title: "لیف و اسفنج حمام", note: "", isEssential: false }
        ]
      }
    ]
  },
  {
    id: "cleaning-supplies",
    version: 4,
    title: "شوینده و نظافت",
    description: "مواد مصرفی نظافت خانه و لباس",
    icon: "🧽",
    categories: [
      {
        id: "cleaning-consumables",
        name: "مواد شوینده و نظافت",
        icon: "🫧",
        items: [
          { id: "dishwashing-liquid", title: "مایع ظرفشویی", note: "", isEssential: true },
          { id: "laundry-detergent", title: "پودر یا مایع لباسشویی", note: "", isEssential: true },
          { id: "sponge", title: "اسکاچ و اسفنج", note: "", isEssential: true },
          { id: "trash-bags", title: "کیسه زباله", note: "", isEssential: true },
          { id: "bleach", title: "سفیدکننده", note: "", isEssential: true },
          { id: "multi-purpose-cleaner", title: "پاک‌کننده چندمنظوره", note: "", isEssential: true },
          { id: "glass-cleaner", title: "شیشه‌پاک‌کن", note: "", isEssential: true },
          { id: "toilet-cleaner", title: "شوینده سرویس بهداشتی", note: "", isEssential: true },
          { id: "rubber-gloves", title: "دستکش نظافت", note: "", isEssential: true },
          { id: "cleaning-cloths", title: "دستمال نظافت", note: "", isEssential: true },
          { id: "dishwasher-tablets", title: "قرص ماشین ظرفشویی", note: "", isEssential: false },
          { id: "softener", title: "نرم‌کننده لباس", note: "", isEssential: false },
          { id: "floor-cleaner", title: "مایع زمین‌شوی", note: "", isEssential: false },
          { id: "descaler", title: "جرم‌گیر", note: "", isEssential: false },
          { id: "steel-wool", title: "سیم ظرفشویی", note: "", isEssential: false },
          { id: "air-freshener", title: "خوشبوکننده هوا", note: "", isEssential: false },
          { id: "insect-spray", title: "حشره‌کش", note: "", isEssential: false },
          { id: "hand-sanitizer", title: "ژل ضدعفونی‌کننده", note: "", isEssential: false },
          { id: "drain-cleaner", title: "لوله‌بازکن", note: "", isEssential: false },
          { id: "washing-machine-cleaner", title: "جرم‌گیر ماشین لباسشویی", note: "", isEssential: false },
          { id: "dishwasher-cleaner", title: "جرم‌گیر ماشین ظرفشویی", note: "", isEssential: false },
          { id: "fabric-stain-remover", title: "لکه‌بر لباس", note: "", isEssential: false },
          { id: "scouring-powder", title: "پودر شوینده سطوح", note: "", isEssential: false },
          { id: "mop-refill", title: "یدک تی", note: "", isEssential: false },
          { id: "dishwasher-salt", title: "نمک ماشین ظرفشویی", note: "", isEssential: false },
          { id: "carpet-shampoo", title: "شامپو فرش و مبل", note: "", isEssential: false }
        ]
      }
    ]
  },
  {
    id: "kitchen-consumables",
    version: 4,
    title: "مصرفی آشپزخانه",
    description: "اقلامی که برای نگهداری و مصرف روزانه غذا تمام می‌شوند",
    icon: "🍽️",
    categories: [
      {
        id: "kitchen-packaging",
        name: "کیسه و نگهداری غذا",
        icon: "🧻",
        items: [
          { id: "freezer-bags", title: "کیسه فریزر", note: "", isEssential: true },
          { id: "paper-towels", title: "حوله کاغذی", note: "", isEssential: true },
          { id: "plastic-wrap", title: "سلفون", note: "", isEssential: true },
          { id: "aluminum-foil", title: "فویل آلومینیومی", note: "", isEssential: false },
          { id: "zipper-bags", title: "کیسه زیپ‌دار", note: "", isEssential: false },
          { id: "food-storage-bags", title: "کیسه نگهداری غذا", note: "", isEssential: false },
          { id: "baking-paper", title: "کاغذ روغنی", note: "", isEssential: false },
          { id: "coffee-filters", title: "فیلتر قهوه", note: "", isEssential: false }
        ]
      },
      {
        id: "kitchen-tableware",
        name: "سفره و ظروف یک‌بارمصرف",
        icon: "🍽️",
        items: [
          { id: "disposable-tablecloth", title: "سفره یک‌بار مصرف", note: "", isEssential: true },
          { id: "disposable-gloves", title: "دستکش یک‌بارمصرف", note: "", isEssential: true },
          { id: "napkins", title: "دستمال سفره", note: "", isEssential: false },
          { id: "toothpicks", title: "خلال دندان", note: "", isEssential: false },
          { id: "straws", title: "نی", note: "", isEssential: false },
          { id: "disposable-cups", title: "لیوان یک‌بارمصرف", note: "", isEssential: false },
          { id: "disposable-plates", title: "ظرف یک‌بارمصرف", note: "", isEssential: false },
          { id: "wooden-skewers", title: "سیخ چوبی", note: "", isEssential: false },
          { id: "disposable-cutlery", title: "قاشق و چنگال یک‌بارمصرف", note: "قاشق، چنگال و کارد", isEssential: false }
        ]
      },
      {
        id: "kitchen-picnic",
        name: "منقل، آتش‌زا و مناسبتی",
        icon: "🔥",
        items: [
          { id: "matches", title: "کبریت و فندک", note: "", isEssential: true },
          { id: "charcoal", title: "زغال", note: "مصرف مناسبتی", isEssential: false },
          { id: "cake-candles", title: "شمع تولد", note: "مصرف مناسبتی", isEssential: false },
          { id: "firestarter-gel", title: "ژل آتش‌زا", note: "برای باربیکیو و زغال", isEssential: false }
        ]
      }
    ]
  },
  {
    id: "home-consumables",
    version: 3,
    title: "مصرفی خانه",
    description: "اقلام کوچک و مصرفی برای استفاده روزمره خانه",
    icon: "🏠",
    categories: [
      {
        id: "home-maintenance",
        name: "فنی و الکتریکی",
        icon: "💡",
        items: [
          { id: "batteries", title: "باتری قلمی", note: "در صورت نیاز", isEssential: true },
          { id: "light-bulbs", title: "لامپ یدک", note: "در صورت سوختن", isEssential: true },
          { id: "adhesive-tape", title: "چسب نواری", note: "", isEssential: true },
          { id: "super-glue", title: "چسب قطره‌ای", note: "", isEssential: false },
          { id: "vacuum-bags", title: "پاکت جاروبرقی", note: "یک‌بارمصرف یا دائمی", isEssential: false },
          { id: "lighter-gas", title: "گاز فندک", note: "", isEssential: false }
        ]
      },
      {
        id: "home-care-clothing",
        name: "خیاطی و کفش",
        icon: "🧵",
        items: [
          { id: "sewing-thread", title: "نخ خیاطی", note: "", isEssential: false },
          { id: "sewing-needles", title: "سوزن", note: "", isEssential: false },
          { id: "shoe-polish", title: "واکس کفش", note: "", isEssential: false },
          { id: "laundry-bag", title: "کیسه لباسشویی", note: "", isEssential: false }
        ]
      },
      {
        id: "home-medical",
        name: "بهداشت و کمک‌های اولیه",
        icon: "🩹",
        items: [
          { id: "first-aid-refill", title: "اقلام مصرفی کمک‌های اولیه", note: "چسب زخم و باند", isEssential: true },
          { id: "rubbing-alcohol", title: "الکل بهداشتی و صنعتی", note: "برای ضدعفونی و نظافت", isEssential: true }
        ]
      },
      {
        id: "home-pets-plants",
        name: "گل و گیاه و حیوانات خانگی",
        icon: "🐾",
        items: [
          { id: "plant-soil", title: "خاک و کود گیاه", note: "در صورت داشتن گیاه", isEssential: false },
          { id: "pet-food", title: "غذای حیوان خانگی", note: "در صورت نیاز", isEssential: false },
          { id: "pet-litter", title: "خاک گربه", note: "در صورت نیاز", isEssential: false }
        ]
      }
    ]
  },
  {
    id: "breakfast-drinks",
    version: 4,
    title: "صبحانه و نوشیدنی",
    description: "اقلامی برای صبحانه و نوشیدنی‌های روزانه",
    icon: "☕",
    categories: [
      {
        id: "breakfast-food",
        name: "صبحانه و مربا",
        icon: "🍯",
        items: [
          { id: "breakfast-bread", title: "نان صبحانه", note: "", isEssential: true },
          { id: "honey", title: "عسل", note: "", isEssential: true },
          { id: "breakfast-jam", title: "مربا", note: "", isEssential: true },
          { id: "dates", title: "خرما", note: "", isEssential: true },
          { id: "walnuts", title: "گردو", note: "", isEssential: true },
          { id: "toast-bread", title: "نان تست", note: "", isEssential: false },
          { id: "peanut-butter", title: "کره بادام‌زمینی", note: "", isEssential: false },
          { id: "halva", title: "حلواشکری", note: "", isEssential: false },
          { id: "cereal", title: "غلات صبحانه", note: "", isEssential: false },
          { id: "oats", title: "جو دوسر پرک", note: "", isEssential: false },
          { id: "chocolate-spread", title: "شکلات صبحانه", note: "", isEssential: false },
          { id: "tahini-paste", title: "ارده", note: "کنجد خالص", isEssential: false },
          { id: "date-grape-syrup", title: "شیره خرما و انگور", note: "شیره طبیعی یا سه شیره", isEssential: false }
        ]
      },
      {
        id: "breakfast-hot-drinks",
        name: "چای، قهوه و نوشیدنی گرم",
        icon: "☕",
        items: [
          { id: "black-tea", title: "چای سیاه", note: "", isEssential: true },
          { id: "tea-bags", title: "چای کیسه ای", note: "", isEssential: false },
          { id: "green-tea", title: "چای سبز و دمنوش", note: "", isEssential: false },
          { id: "instant-coffee", title: "قهوه فوری", note: "", isEssential: false },
          { id: "hot-chocolate", title: "هات‌چاکلت", note: "", isEssential: false }
        ]
      },
      {
        id: "breakfast-cold-drinks",
        name: "نوشیدنی‌های سرد",
        icon: "🥤",
        items: [
          { id: "syrup", title: "شربت و پودر نوشیدنی", note: "", isEssential: false },
          { id: "soft-drink", title: "نوشابه", note: "", isEssential: false },
          { id: "malt-drink", title: "دلستر", note: "", isEssential: false },
          { id: "fruit-juice", title: "آبمیوه", note: "طبیعی یا پاکتی", isEssential: false },
          { id: "energy-drink", title: "نوشیدنی انرژی‌زا", note: "", isEssential: false },
          { id: "chewing-gum", title: "آدامس", note: "بدون شکر یا طعم‌دار", isEssential: false }
        ]
      }
    ]
  },
  {
    id: "home-office",
    version: 2,
    title: "لوازم اداری و تحریر",
    description: "اقلام مصرفی برای میز کار و یادداشت‌برداری در خانه",
    icon: "📎",
    categories: [
      {
        id: "stationery",
        name: "نوشت‌افزار",
        icon: "🖊️",
        items: [
          { id: "pens", title: "خودکار و روان‌نویس", isEssential: true },
          { id: "printer-paper", title: "کاغذ A4", note: "برای پرینتر خانگی", isEssential: true },
          { id: "sticky-notes", title: "کاغذ یادداشت چسب‌دار", isEssential: true },
          { id: "highlighters", title: "ماژیک هایلایت", isEssential: false },
          { id: "paper-clips", title: "گیره کاغذ و پونز", isEssential: false }
        ]
      }
    ]
  }
]
