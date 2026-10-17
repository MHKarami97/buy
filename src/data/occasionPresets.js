function items(prefix, titles) {
  return titles.map((title, index) => ({ id: `${prefix}-${index + 1}`, title, note: '' }))
}

export var occasionPresets = [
  {
    id: 'party',
    title: 'مهمانی',
    description: 'پذیرایی، نوشیدنی و لوازم یکبارمصرف',
    icon: '🎉',
    categories: [
      {
        id: 'party-drinks',
        name: 'نوشیدنی',
        icon: '🥤',
        items: items('party-drinks', ['نوشابه', 'دوغ', 'آب معدنی', 'آب‌میوه', 'ماءالشعیر', 'چای', 'قهوه', 'شربت', 'یخ'])
      },
      {
        id: 'party-food',
        name: 'غذا',
        icon: '🍽️',
        items: items('party-food', ['برنج', 'مرغ یا گوشت', 'نان', 'سالاد و سبزی', 'ماست و خیار', 'ترشی', 'سس', 'پیش‌غذا'])
      },
      {
        id: 'party-snacks',
        name: 'میوه و تنقلات',
        icon: '🍉',
        items: items('party-snacks', ['میوه', 'آجیل', 'چیپس و پفک', 'شیرینی', 'شکلات', 'تخمه'])
      },
      {
        id: 'party-supplies',
        name: 'لوازم یکبارمصرف',
        icon: '🥄',
        items: items('party-supplies', ['بشقاب', 'لیوان', 'قاشق و چنگال', 'دستمال کاغذی', 'سفره یکبارمصرف', 'کیسه زباله', 'فویل آلومینیوم'])
      }
    ]
  },
  {
    id: 'trip',
    title: 'سفر',
    description: 'خوراکی، بهداشتی و لوازم ضروری سفر',
    icon: '🧳',
    categories: [
      {
        id: 'trip-food',
        name: 'خوراکی سفر',
        icon: '🥪',
        items: items('trip-food', ['نان', 'پنیر و کره', 'میوه', 'آب معدنی', 'تنقلات', 'چای کیسه‌ای', 'بیسکویت', 'آب‌میوه'])
      },
      {
        id: 'trip-health',
        name: 'بهداشتی و دارو',
        icon: '🧴',
        items: items('trip-health', ['مسواک و خمیردندان', 'شامپو و صابون', 'دستمال مرطوب', 'ضدآفتاب', 'داروهای شخصی', 'چسب زخم', 'ژل ضدعفونی‌کننده'])
      },
      {
        id: 'trip-gear',
        name: 'لوازم سفر',
        icon: '🎒',
        items: items('trip-gear', ['پاوربانک', 'کیسه زباله', 'کیسه فریزر', 'دستمال کاغذی', 'ظرف یکبارمصرف', 'چتر'])
      }
    ]
  },
  {
    id: 'birthday',
    title: 'تولد',
    description: 'کیک، تزیین و پذیرایی جشن تولد',
    icon: '🎂',
    categories: [
      {
        id: 'birthday-cake',
        name: 'کیک و شیرینی',
        icon: '🍰',
        items: items('birthday-cake', ['کیک تولد', 'شمع', 'فندک', 'شیرینی', 'بستنی'])
      },
      {
        id: 'birthday-decor',
        name: 'تزیین و کادو',
        icon: '🎈',
        items: items('birthday-decor', ['بادکنک', 'بنر تولد', 'کلاه تولد', 'روبان', 'کادو', 'کاغذ کادو', 'کارت تبریک', 'چسب'])
      },
      {
        id: 'birthday-catering',
        name: 'پذیرایی',
        icon: '🥤',
        items: items('birthday-catering', ['نوشابه', 'آب‌میوه', 'چیپس و پفک', 'میوه', 'بشقاب و لیوان یکبارمصرف', 'دستمال کاغذی'])
      }
    ]
  },
  {
    id: 'nowruz',
    title: 'نوروز',
    description: 'سفره هفت‌سین، شیرینی و خانه‌تکانی',
    icon: '🌱',
    categories: [
      {
        id: 'nowruz-haftsin',
        name: 'هفت‌سین',
        icon: '🪞',
        items: items('nowruz-haftsin', ['سبزه', 'سیب', 'سنجد', 'سیر', 'سماق', 'سمنو', 'سرکه', 'سکه', 'آینه', 'شمع', 'ماهی قرمز', 'تخم‌مرغ رنگی', 'سنبل'])
      },
      {
        id: 'nowruz-sweets',
        name: 'شیرینی و آجیل',
        icon: '🍬',
        items: items('nowruz-sweets', ['شیرینی', 'آجیل', 'شکلات', 'میوه', 'تخمه'])
      },
      {
        id: 'nowruz-cooking',
        name: 'غذای شب عید',
        icon: '🐟',
        items: items('nowruz-cooking', ['ماهی', 'برنج', 'سبزی پلو', 'تخم‌مرغ', 'روغن'])
      },
      {
        id: 'nowruz-cleaning',
        name: 'خانه‌تکانی',
        icon: '🧽',
        items: items('nowruz-cleaning', ['مایع شیشه‌پاک‌کن', 'پاک‌کننده چندمنظوره', 'دستکش نظافت', 'دستمال نظافت', 'کیسه زباله'])
      }
    ]
  },
  {
    id: 'yalda',
    title: 'شب یلدا',
    description: 'میوه، آجیل و شیرینی شب یلدا',
    icon: '🍉',
    categories: [
      {
        id: 'yalda-fruits',
        name: 'میوه',
        icon: '🍎',
        items: items('yalda-fruits', ['هندوانه', 'انار', 'خرمالو', 'پرتقال', 'سیب'])
      },
      {
        id: 'yalda-nuts',
        name: 'آجیل و شیرینی',
        icon: '🥜',
        items: items('yalda-nuts', ['آجیل شب یلدا', 'تخمه', 'میوه خشک', 'شیرینی', 'شکلات', 'لواشک'])
      },
      {
        id: 'yalda-drinks',
        name: 'نوشیدنی و پذیرایی',
        icon: '🍵',
        items: items('yalda-drinks', ['چای', 'نبات', 'شربت', 'دستمال کاغذی', 'ظرف یکبارمصرف'])
      }
    ]
  },
  {
    id: 'bbq',
    title: 'کباب و باربیکیو',
    description: 'گوشت، زغال و لوازم کباب',
    icon: '🍖',
    categories: [
      {
        id: 'bbq-food',
        name: 'مواد غذایی',
        icon: '🥩',
        items: items('bbq-food', ['گوشت', 'مرغ', 'نان', 'گوجه‌فرنگی', 'فلفل دلمه‌ای', 'پیاز', 'سبزی خوردن', 'سماق', 'ادویه', 'دوغ و نوشابه'])
      },
      {
        id: 'bbq-gear',
        name: 'لوازم',
        icon: '🔥',
        items: items('bbq-gear', ['زغال', 'فندک', 'آتش‌زنه', 'سیخ', 'فویل آلومینیوم', 'بادبزن', 'بشقاب یکبارمصرف', 'کیسه زباله'])
      }
    ]
  },
  {
    id: 'picnic',
    title: 'پیک‌نیک و طبیعت‌گردی',
    description: 'خوراکی و لوازم یک روز بیرون از خانه',
    icon: '🏕️',
    categories: [
      {
        id: 'picnic-food',
        name: 'خوراکی',
        icon: '🥙',
        items: items('picnic-food', ['نان', 'پنیر', 'خیار و گوجه', 'میوه', 'آب معدنی', 'چای و قند', 'تنقلات', 'آب‌میوه'])
      },
      {
        id: 'picnic-gear',
        name: 'لوازم',
        icon: '⛺',
        items: items('picnic-gear', ['زیرانداز', 'ظرف و لیوان یکبارمصرف', 'دستمال کاغذی', 'کیسه زباله', 'ضدآفتاب', 'دستمال مرطوب', 'حشره‌کش'])
      }
    ]
  }
]
