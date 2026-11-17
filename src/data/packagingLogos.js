/**
 * Packaging Logos & Regulatory Symbols Database (Iran & International Standards)
 * -----------------------------------------------------------------------------
 * Clean vector SVGs and comprehensive educational guides for symbols printed
 * on food, dairy, detergents, cosmetics, and household products in Iran.
 */

export var LOGO_CATEGORIES = [
  { id: 'all', titleFa: 'همه نشان‌ها' },
  { id: 'health_gov', titleFa: 'رسمی و سلامت ایران 🇮🇷' },
  { id: 'personal_care', titleFa: 'آرایشی و بهداشتی 🧴' },
  { id: 'recycle', titleFa: 'بازیافت و محیط‌زیست ♻️' },
  { id: 'usage', titleFa: 'نگهداری و مصرف ظروف 🍽️' }
]

export var PACKAGING_LOGOS = [
  // 1. استاندارد ایران
  {
    id: 'isiri-standard',
    category: 'health_gov',
    titleFa: 'نشان استاندارد ملی ایران (INSO)',
    authorityFa: 'سازمان ملی استاندارد ایران',
    badge: 'الزامی / تشویقی',
    badgeTone: 'emerald',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#059669" fill-opacity="0.1" stroke="#059669" stroke-width="3"/>
      <path d="M32 10 L54 32 L32 54 L10 32 Z" stroke="#059669" stroke-width="2.5" fill="none"/>
      <circle cx="32" cy="32" r="9" fill="#059669"/>
      <path d="M26 32 C26 28 38 28 38 32 C38 36 26 36 26 32" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="22" r="2" fill="#059669"/>
      <circle cx="32" cy="42" r="2" fill="#059669"/>
    </svg>`,
    summaryFa: 'مهم‌ترین نشان اطمینان از کیفیت، ایمنی و سلامت کالاهای تولیدی در ایران.',
    descriptionFa: 'این نشان تایید می‌کند که فرآورده تمامی ویژگی‌ها و آزمون‌های استاندارد ملی ایران را پشت سر گذاشته است. برای مواد غذایی، لبنیات، شوینده‌ها و وسایل برقی اجباری است.',
    whereFa: 'روی تمام بسته‌بندی‌های مواد غذایی معتبر، روغن، شیر، شوینده‌ها و مصالح خانگی.',
    verificationFa: 'ارسال کد ۱۰ رقمی زیر علامت استاندارد به سامانه پیامکی ۱۰۰۰۱۵۱۷ جهت دریافت نام برند، تاریخ اعتبار و وضعیت پروانه.'
  },

  // 2. سیب سلامت
  {
    id: 'ifda-apple',
    category: 'health_gov',
    titleFa: 'نشان سیب سلامت (سازمان غذا و دارو)',
    authorityFa: 'سازمان غذا و دارو (وزارت بهداشت)',
    badge: 'پروانه ساخت بهداشتی',
    badgeTone: 'sky',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="#0284C7" fill-opacity="0.1" stroke="#0284C7" stroke-width="2"/>
      <!-- برگ سبز -->
      <path d="M32 14 C36 10 44 12 42 18 C38 20 34 18 32 14 Z" fill="#10B981" stroke="#059669" stroke-width="1.5"/>
      <!-- سیب و انسان نمادین -->
      <path d="M20 28 C20 22 28 22 32 26 C36 22 44 22 44 28 C44 38 36 46 32 48 C28 46 20 38 20 28 Z" fill="#0284C7" fill-opacity="0.85" stroke="#0369A1" stroke-width="2"/>
      <circle cx="32" cy="32" r="4" fill="#FFFFFF"/>
      <path d="M26 38 C28 41 36 41 38 38" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    summaryFa: 'مجوز رسمی بهداشتی بودن مواد غذایی و آشامیدنی از وزارت بهداشت.',
    descriptionFa: 'نشان می‌دهد فرآورده در کارخانه‌ای دارای پروانه تاسیس و بهره‌برداری بهداشتی تولید شده و فاقد آلودگی میکروبی یا مواد غیرمجاز است.',
    whereFa: 'کنسروها، لبنیات، کیک و بیسکویت، سس‌ها و فرآورده‌های گوشتی.',
    verificationFa: 'شماره پروانه بهداشتی ساخت (فرمت ۲ رقمی / ۵ رقمی مانند ۳۲/۱۱۱۵۹) زیر لوگوی سیب سلامت چاپ می‌شود.'
  },

  // 3. نشان حلال
  {
    id: 'halal-mark',
    category: 'health_gov',
    titleFa: 'نشان جهانی حلال (Halal)',
    authorityFa: 'مرکز تحقیقات و اطلاع‌رسانی حلال (OIC)',
    badge: 'تطابق فقهی و بهداشتی',
    badgeTone: 'emerald',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="#10B981" fill-opacity="0.1" stroke="#10B981" stroke-width="2.5"/>
      <!-- هلال ماه -->
      <path d="M40 18 C32 18 24 24 24 32 C24 40 32 46 40 46 C34 44 30 38 30 32 C30 26 34 20 40 18 Z" fill="#059669"/>
      <!-- کلمه حلال -->
      <text x="32" y="36" font-size="11" font-weight="bold" fill="#065F46" text-anchor="middle" font-family="sans-serif">HALAL</text>
      <text x="32" y="44" font-size="8" fill="#047857" text-anchor="middle" font-family="sans-serif">حلال</text>
    </svg>`,
    summaryFa: 'تایید حلال و بهداشتی بودن کامل مواد اولیه و مراحل تولید فرآورده.',
    descriptionFa: 'ضامن عدم وجود ترکیبات غیرمجاز مانند الکل، ژلاتین خوکی یا گوشت غیرذبح اسلامی در محصول.',
    whereFa: 'روی گوشت، مرغ، سوسیس، کالباس، شکلات، پاستیل و ژله‌های خوراکی.',
    verificationFa: 'صادرشده زیر نظر موسسه استاندارد حلال و اتاق بازرگانی کشورهای اسلامی.'
  },

  // 4. چراغ راهنمای تغذیه
  {
    id: 'nutrition-traffic-light',
    category: 'health_gov',
    titleFa: 'نشانگر رنگی تغذیه‌ای (چراغ راهنمای سلامت)',
    authorityFa: 'سازمان غذا و داروی ایران',
    badge: 'سنجش سلامت ۵ فاکتور',
    badgeTone: 'amber',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="52" height="44" rx="8" fill="#F8FAFC" stroke="#94A3B8" stroke-width="2"/>
      <!-- ۵ دایره نمادین چراغ راهنما -->
      <circle cx="14" cy="24" r="5" fill="#EF4444"/>
      <circle cx="23" cy="24" r="5" fill="#F59E0B"/>
      <circle cx="32" cy="24" r="5" fill="#10B981"/>
      <circle cx="41" cy="24" r="5" fill="#10B981"/>
      <circle cx="50" cy="24" r="5" fill="#F59E0B"/>
      <!-- خطوط شاخص‌ها -->
      <rect x="10" y="34" width="44" height="2" fill="#CBD5E1"/>
      <text x="32" y="46" font-size="7" font-weight="bold" fill="#475569" text-anchor="middle">قند • چربی • نمک • ترانس</text>
    </svg>`,
    summaryFa: 'راهنمای سریع میزان سلامت خوراکی با رنگ‌های سبز، زرد و قرمز.',
    descriptionFa: 'هر کادر وضعیت ۵ شاخص کلیدی را نشان می‌دهد: سبز (کم و سالم)، نارنجی (متوسط)، قرمز (زیاد؛ نیازمند مصرف محتاطانه مخصوصاً برای بیماران دیابتی و قلبی).',
    whereFa: 'روی تمام اسنک‌ها، نوشابه‌ها، شیرینی، بیسکویت، لبنیات و غذاهای آماده صنعتی.',
    verificationFa: 'الزام قانونی سازمان غذا و دارو روی تمامی محصولات خوراکی تولید داخل.'
  },

  // 5. برچسب اصالت TTAC
  {
    id: 'ttac-authenticity',
    category: 'health_gov',
    titleFa: 'برچسب اصالت و رهگیری دارو و سلامت (TTAC)',
    authorityFa: 'سامانه ردیابی وزارت بهداشت',
    badge: 'استعلام اصالت پیامکی/اینترنتی',
    badgeTone: 'sky',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="52" height="48" rx="6" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
      <rect x="10" y="12" width="20" height="20" rx="3" fill="#0F172A"/>
      <!-- QR مینیاتوری -->
      <rect x="13" y="15" width="5" height="5" fill="#FFFFFF"/>
      <rect x="22" y="15" width="5" height="5" fill="#FFFFFF"/>
      <rect x="13" y="24" width="5" height="5" fill="#FFFFFF"/>
      <!-- لایه خراشیدنی اصالت -->
      <rect x="10" y="36" width="44" height="14" rx="3" fill="#94A3B8" stroke="#64748B" stroke-width="1.5"/>
      <text x="32" y="46" font-size="7" font-weight="bold" fill="#0F172A" text-anchor="middle">کد اصالت ۱۶ رقمی</text>
      <text x="43" y="22" font-size="8" font-weight="bold" fill="#854D0E" text-anchor="middle">TTAC</text>
      <text x="43" y="30" font-size="6" fill="#713F12" text-anchor="middle">سازمان غذا و دارو</text>
    </svg>`,
    summaryFa: 'برچسب زرد و نقره‌ای برای اطمینان قطعی از عدم قاچاق و اصالت دارو و بهداشتی.',
    descriptionFa: 'شامل شناسه ردیابی (UID)، کد بین‌المللی کالا (GTIN) و کد ۱۶ رقمی اصالت در زیر لایه طوسی‌رنگ قابل خراشیدن است.',
    whereFa: 'داروها، مکمل‌های ورزشی و تغذیه‌ای، کرم‌ها و لوازم آرایشی وارداتی و تخصصی.',
    verificationFa: 'ارسال کد ۱۶ رقمی زیر لایه اسکرچ به پیامک ۲۰۰۰۸۸۲۲ یا اسکن در نرم‌افزار تی‌تک (ttac.ir).'
  },

  // 6. دوره مصرف پس از باز شدن (PAO)
  {
    id: 'pao-symbol',
    category: 'personal_care',
    titleFa: 'دوره پس از باز شدن (PAO - Period After Opening)',
    authorityFa: 'استاندارد بین‌المللی آرایشی و بهداشتی',
    badge: 'تاریخ انقضای پس از باز شدن',
    badgeTone: 'amber',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- قوطی کرم باز -->
      <path d="M14 30 L50 30 L46 54 C46 56 44 58 40 58 L24 58 C20 58 18 56 18 54 Z" fill="#F8FAFC" stroke="#0284C7" stroke-width="2.5"/>
      <!-- درب معلق کج -->
      <ellipse cx="32" cy="30" rx="18" ry="4" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
      <path d="M16 22 L44 14" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M16 22 C18 16 42 8 44 14" stroke="#0284C7" stroke-width="2"/>
      <!-- متن 12M یا 6M -->
      <text x="32" y="48" font-size="12" font-weight="bold" fill="#0369A1" text-anchor="middle" font-family="monospace">12M</text>
    </svg>`,
    summaryFa: 'مدت‌زمان مصرف ایمن محصول پس از باز کردن درب یا پلمپ اولیه.',
    descriptionFa: 'قوطی در باز همراه با یک عدد و حرف M (مانند 6M یا 12M یا 24M)؛ به این معناست که محصول پس از اولین بار باز شدن، تا چند ماه خاصیت بهداشتی خود را حفظ می‌کند.',
    whereFa: 'کرم‌های ضدآفتاب، مرطوب‌کننده، لوسیون بدن، شامپو و ریمل.',
    verificationFa: 'حتی اگر تاریخ انقضای چاپ‌شده روی بسته نرسیده باشد، پس از سپری شدن این مدت نباید استفاده شود.'
  },

  // 7. بدون تست روی حیوانات (Cruelty Free)
  {
    id: 'cruelty-free',
    category: 'personal_care',
    titleFa: 'عدم تست بر روی حیوانات (Cruelty-Free)',
    authorityFa: 'ائتلاف بین‌المللی حمایت از حیوانات (CCIC)',
    badge: 'حامی محیط‌زیست و حیوانات',
    badgeTone: 'emerald',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
      <!-- خرگوش مینیاتوری -->
      <path d="M22 42 C22 36 26 34 30 34 C33 34 36 32 36 28 C36 24 34 16 38 16 C42 16 40 24 40 28 C43 27 48 28 48 32 C48 36 44 42 38 44 C32 46 22 46 22 42 Z" fill="#059669"/>
      <circle cx="35" cy="25" r="1.5" fill="#FFFFFF"/>
      <path d="M30 44 C26 44 24 40 26 38" stroke="#059669" stroke-width="1.5"/>
    </svg>`,
    summaryFa: 'عدم آزمایش فرآورده یا مواد تشکیل‌دهنده آن روی حیوانات زنده.',
    descriptionFa: 'نشان می‌دهد ایمنی محصول از طریق روش‌های نوین آزمایشگاهی، کشت سلولی یا آزمایش‌های انسانی بدون آسیب به حیوانات سنجیده شده است.',
    whereFa: 'شامپوها، محصولات پوست و مو، صابون‌ها و برندهای آرایشی حامی طبیعت.',
    verificationFa: 'تاییدشده توسط گواهی بین‌المللی Leaping Bunny یا PETA.'
  },

  // 8. ارجاع به بروشور داخل جعبه
  {
    id: 'refer-insert',
    category: 'personal_care',
    titleFa: 'مطالعه بروشور داخل جعبه (Refer to Insert)',
    authorityFa: 'استاندارد راهنمای مصرف دارویی و بهداشتی',
    badge: 'اطلاعات و هشدارها',
    badgeTone: 'slate',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="#F1F5F9" stroke="#64748B" stroke-width="2"/>
      <!-- کتاب باز -->
      <path d="M16 26 C22 24 30 26 32 28 C34 26 42 24 48 26 L48 46 C42 44 34 46 32 48 C30 46 22 44 16 46 Z" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
      <line x1="32" y1="28" x2="32" y2="48" stroke="#334155" stroke-width="2"/>
      <!-- انگشت اشاره -->
      <path d="M30 14 L30 24" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
      <polygon points="27,24 33,24 30,28" fill="#0284C7"/>
    </svg>`,
    summaryFa: 'ضرورت مطالعه بروشور داخل جعبه برای آگاهی از نحوه مصرف و هشدارها.',
    descriptionFa: 'زمانی درج می‌شود که به علت کوچک بودن سطح ظرف، امکان نوشتن تمام عوارض، ترکیبات و هشدارهای مهم وجود نداشته است.',
    whereFa: 'رنگ مو، قطره‌های دارویی، کرم‌های لایه‌بردار و مکمل‌های غذایی.',
    verificationFa: 'پیش از مصرف محصول، بروشور کاغذی داخل بسته‌بندی را حتماً مطالعه کنید.'
  },

  // 9. تماس با غذا (جام و چنگال)
  {
    id: 'food-contact',
    category: 'usage',
    titleFa: 'مناسب تماس با مواد غذایی (Food Grade - جام و چنگال)',
    authorityFa: 'استاندارد ظروف و بسته‌بندی غذا (اروپا و ایران)',
    badge: 'ایمنی تغذیه',
    badgeTone: 'emerald',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="52" height="52" rx="12" fill="#ECFDF5" stroke="#059669" stroke-width="2"/>
      <!-- لیوان / جام -->
      <path d="M22 18 L34 18 L34 26 C34 32 28 34 28 38 L28 46 L34 46" stroke="#059669" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="22" y1="46" x2="34" y2="46" stroke="#059669" stroke-width="2.5" stroke-linecap="round"/>
      <!-- چنگال -->
      <path d="M42 18 L42 26 C42 30 38 32 38 36 L38 46" stroke="#059669" stroke-width="2" stroke-linecap="round"/>
      <line x1="46" y1="18" x2="46" y2="26" stroke="#059669" stroke-width="2"/>
      <line x1="38" y1="18" x2="38" y2="26" stroke="#059669" stroke-width="2"/>
    </svg>`,
    summaryFa: 'تایید می‌کند این ظرف برای نگهداری و تماس با خوراکی‌ها کاملاً بی‌خطر است.',
    descriptionFa: 'نشان می‌دهد متریال ظرف یا پلاستیک، هیچ‌گونه ماده شیمیایی سمی یا فلزات سنگین به غذا منتقل نمی‌کند و بو و طعم غذا را تغییر نمی‌دهد.',
    whereFa: 'ظروف فریزری، کیسه فریزر، قمقمه آب، ظروف یک‌بارمصرف و تخته‌های گوشت.',
    verificationFa: 'از قرار دادن مواد غذایی در پلاستیک‌های صنعتی فاقد این نشان خودداری فرمایید.'
  },

  // 10. حلقه موبیوس (بازیافت)
  {
    id: 'mobius-loop',
    category: 'recycle',
    titleFa: 'حلقه موبیوس (علامت بین‌المللی بازیافت)',
    authorityFa: 'استاندارد بین‌المللی بازیافت مواد (ISO 14021)',
    badge: 'قابل بازیافت',
    badgeTone: 'emerald',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- ۳ فلش به هم پیوسته بازیافت -->
      <path d="M32 10 L38 18 L32 26 L22 26 L16 36 L24 40 L28 32 L38 32 L46 44 L40 48" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <polygon points="34,8 30,16 38,16" fill="#059669"/>
      <polygon points="50,42 42,44 46,50" fill="#059669"/>
      <polygon points="14,34 20,38 16,42" fill="#059669"/>
    </svg>`,
    summaryFa: 'بسته‌بندی این کالا پس از مصرف، قابل تفکیک و بازیافت مجدد است.',
    descriptionFa: 'سه فلش متوالی نشان‌دهنده چرخه بازیافت مواد (جمع‌آوری، فرآوری و استفاده مجدد) است تا زباله به طبیعت بازنگردد.',
    whereFa: 'روی جعبه‌های مقوایی، بطری‌های شیشه‌ای و قوطی‌های آلومینیومی کنسرو.',
    verificationFa: 'لطفاً این ظروف را تفکیک کرده و در مخازن پسماند خشک قرار دهید.'
  },

  // 11. کدهای پلاستیک (PETE 01 و PP 05)
  {
    id: 'plastic-codes',
    category: 'recycle',
    titleFa: 'کدهای بازیافت پلاستیک (مثل 01 PETE یا 05 PP)',
    authorityFa: 'انجمن صنعت پلاستیک (SPI)',
    badge: 'شناسه نوع پلیمر',
    badgeTone: 'sky',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 12 L48 40 L16 40 Z" stroke="#0284C7" stroke-width="3" stroke-linejoin="round" fill="none"/>
      <!-- فلش‌های بازیافت مثلثی -->
      <polygon points="32,8 36,14 28,14" fill="#0284C7"/>
      <!-- عدد ۵ نماد PP یا ۱ نماد PET -->
      <text x="32" y="32" font-size="14" font-weight="bold" fill="#0369A1" text-anchor="middle" font-family="monospace">05</text>
      <text x="32" y="52" font-size="9" font-weight="bold" fill="#0284C7" text-anchor="middle" font-family="sans-serif">PP</text>
    </svg>`,
    summaryFa: 'نوع پلیمر ظرف را مشخص می‌کند؛ راهنمای ایمنی ظروف داغ یا فریزری.',
    descriptionFa: 'شماره ۱ (PETE: بطری آب معدنی؛ یک‌بارمصرف)، شماره ۲ (HDPE: شیر و شامپو؛ ایمن)، شماره ۵ (PP: ماست و غذای گرم؛ سالم‌ترین پلاستیک خوراکی)، شماره ۶ (PS: فومی؛ خطرناک برای مایعات داغ).',
    whereFa: 'در ته بطری‌ها، قوطی‌های ماست، پنیر و ظروف پلاستیکی بسته‌بندی.',
    verificationFa: 'برای مواد داغ فقط از ظروف دارای کد ۵ (PP) استفاده کنید و از مصرف مجدد کد ۱ بپرهیزید.'
  },

  // 12. مرد پاکیزه (Tidyman)
  {
    id: 'tidyman-symbol',
    category: 'recycle',
    titleFa: 'نشان مرد پاکیزه (Tidyman - در سطل بیندازید)',
    authorityFa: 'کمپین جهانی پاکیزگی محیط‌زیست',
    badge: 'فرهنگ شهروندی',
    badgeTone: 'slate',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="#F8FAFC" stroke="#64748B" stroke-width="2"/>
      <!-- سر انسان -->
      <circle cx="28" cy="18" r="4" fill="#334155"/>
      <!-- بدن انسان در حال انداختن زباله -->
      <path d="M28 22 L28 36 L22 48" stroke="#334155" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M28 36 L34 48" stroke="#334155" stroke-width="2.5" stroke-linecap="round"/>
      <!-- دست‌ها -->
      <path d="M28 26 L38 28 L42 32" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
      <!-- سطل زباله -->
      <path d="M40 36 L48 36 L46 48 L42 48 Z" fill="#94A3B8" stroke="#334155" stroke-width="1.5"/>
      <circle cx="41" cy="31" r="1.5" fill="#EF4444"/>
    </svg>`,
    summaryFa: 'یادآوری برای انداختن بسته‌بندی در سطل زباله و حفظ بهداشت شهری.',
    descriptionFa: 'تاکید بر احساس مسئولیت مصرف‌کننده در قبال پاکیزگی شهر و طبیعت و نریختن زباله در معابر عمومی.',
    whereFa: 'روی پاکت چیپس، پفک، بیسکویت، آدامس و بطری‌های نوشیدنی.',
    verificationFa: 'همراه با فرهنگ‌سازی تفکیک زباله‌های خشک و تر.'
  },

  // 13. مایکروویو (Microwave Safe)
  {
    id: 'microwave-safe',
    category: 'usage',
    titleFa: 'قابلیت استفاده در مایکروویو (Microwave Safe)',
    authorityFa: 'استاندارد ظروف مقاوم به امواج مایکروفر',
    badge: 'ایمنی حرارتی',
    badgeTone: 'amber',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="48" height="40" rx="8" fill="#FFFBEB" stroke="#D97706" stroke-width="2"/>
      <!-- امواج مایکروفر -->
      <path d="M16 26 C20 22 24 30 28 26 C32 22 36 30 40 26" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
      <path d="M16 34 C20 30 24 38 28 34 C32 30 36 38 40 34" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
      <path d="M16 42 C20 38 24 46 28 42 C32 38 36 46 40 42" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    summaryFa: 'این ظرف در برابر امواج مایکروویو مقاوم است و ذوب یا سمی نمی‌شود.',
    descriptionFa: 'ظروف فاقد این نشان ممکن است در مایکروفر تغییر شکل داده یا مونومرهای خطرناک شیمیایی را وارد غذای گرم کنند.',
    whereFa: 'ظروف نگهدارنده غذای پلاستیکی باکیفیت و ظروف سرامیکی.',
    verificationFa: 'ظروف دارای خط دور طلایی/نقره‌ای فلزی هرگز نباید در مایکروفر قرار گیرند.'
  },

  // 14. ماشین ظرفشویی (Dishwasher Safe)
  {
    id: 'dishwasher-safe',
    category: 'usage',
    titleFa: 'شستشو در ماشین ظرفشویی (Dishwasher Safe)',
    authorityFa: 'استاندارد مقاومت به حرارت و شوینده‌های قلیایی',
    badge: 'شستشوی ایمن',
    badgeTone: 'sky',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="48" height="48" rx="8" fill="#F0F9FF" stroke="#0284C7" stroke-width="2"/>
      <!-- بشقاب‌ها در قفسه -->
      <line x1="14" y1="44" x2="50" y2="44" stroke="#0284C7" stroke-width="2.5"/>
      <ellipse cx="24" cy="34" rx="4" ry="8" stroke="#0284C7" stroke-width="1.5" fill="none"/>
      <ellipse cx="34" cy="34" rx="4" ry="8" stroke="#0284C7" stroke-width="1.5" fill="none"/>
      <ellipse cx="44" cy="34" rx="4" ry="8" stroke="#0284C7" stroke-width="1.5" fill="none"/>
      <!-- قطرات آب از بالا -->
      <path d="M20 16 L18 20" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
      <path d="M32 16 L30 20" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
      <path d="M44 16 L42 20" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    summaryFa: 'مقاومت در برابر دمای بالای آب و پودرهای قوی ماشین ظرفشویی.',
    descriptionFa: 'ظرف در اثر شستشو کدر، مات یا دفرمه نمی‌شود و طرح روی آن پاک نخواهد شد.',
    whereFa: 'ظروف پلاستیکی ضخیم، لیوان‌ها و ظروف غذاخوری.',
    verificationFa: 'اگر ظروف پلاستیکی این علامت را ندارند، آنها را فقط با دست بشویید.'
  },

  // 15. دوری از آفتاب و گرما
  {
    id: 'keep-away-sunlight',
    category: 'usage',
    titleFa: 'دوری از نور مستقیم خورشید و گرما',
    authorityFa: 'استاندارد انبارداری و نگهداری کالا (ISO 780)',
    badge: 'شرایط نگهداری',
    badgeTone: 'amber',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- خورشید -->
      <circle cx="24" cy="24" r="8" fill="#F59E0B"/>
      <!-- پرتوهای نور خورشید -->
      <line x1="24" y1="10" x2="24" y2="13" stroke="#F59E0B" stroke-width="2"/>
      <line x1="10" y1="24" x2="13" y2="24" stroke="#F59E0B" stroke-width="2"/>
      <!-- چتر / سقف محافظ از نور -->
      <path d="M26 14 C36 18 48 30 52 44" stroke="#0F172A" stroke-width="3" stroke-linecap="round"/>
      <line x1="36" y1="28" x2="48" y2="40" stroke="#0F172A" stroke-width="2"/>
    </svg>`,
    summaryFa: 'کالا باید در جای خشک، خنک و تاریک (دور از تابش مستقیم آفتاب) نگهداری شود.',
    descriptionFa: 'نور خورشید و گرما باعث فساد روغن‌ها، اکسیداسیون ویتامین‌ها و آزاد شدن مواد سمی از بطری به درون مایعات می‌شود.',
    whereFa: 'روغن‌های خوراکی، داروها، سرم‌ها، عطرها و بطری‌های آب معدنی.',
    verificationFa: 'هرگز بطری‌های آب یا روغن را در معرض آفتاب فروشگاه یا خودرو قرار ندهید.'
  },

  // 16. ماده قابل اشتعال (Flammable)
  {
    id: 'flammable-hazard',
    category: 'usage',
    titleFa: 'ماده بسیار آتش‌گیر و قابل اشتعال (Flammable)',
    authorityFa: 'استاندارد جهانی برچسب‌گذاری مواد شیمیایی (GHS)',
    badge: 'هشدار ایمنی و خطر',
    badgeTone: 'rose',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="32,6 58,32 32,58 6,32" fill="#FEF2F2" stroke="#EF4444" stroke-width="3"/>
      <!-- شعله آتش -->
      <path d="M32 18 C32 24 38 26 38 32 C38 38 34 44 32 46 C30 44 26 38 26 32 C26 28 30 24 32 18 Z" fill="#EF4444"/>
      <path d="M32 32 C33 35 35 36 35 38 C35 41 33 43 32 44 C31 43 29 41 29 38 C29 36 31 35 32 32 Z" fill="#FCD34D"/>
    </svg>`,
    summaryFa: 'محتویات تحت فشار یا الکل بالا بوده و به سرعت آتش می‌گیرد.',
    descriptionFa: 'باید دور از شعله گاز، فندک، پریز برق و گرمای بالای ۵۰ درجه نگهداری شود و هرگز حتی پس از اتمام سوراخ نگردد.',
    whereFa: 'اسپری خوشبوکننده هوا، اسپری بدن، حشره‌کش‌ها، الکل و استون.',
    verificationFa: 'در محیط با تهویه مناسب استفاده و از دسترس کودکان دور نگه داشته شود.'
  },

  // 17. استاندارد ایمنی اروپا (CE)
  {
    id: 'ce-mark',
    category: 'health_gov',
    titleFa: 'نشان انطباق با مقررات اروپا (CE)',
    authorityFa: 'اتحادیه اروپا (Conformité Européenne)',
    badge: 'استاندارد بین‌المللی',
    badgeTone: 'sky',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="#F8FAFC" stroke="#64748B" stroke-width="1.5"/>
      <!-- حرف C -->
      <path d="M26 20 C18 20 14 26 14 32 C14 38 18 44 26 44" stroke="#1E293B" stroke-width="4.5" stroke-linecap="round"/>
      <!-- حرف E با فاصله استاندارد -->
      <path d="M46 20 C38 20 34 26 34 32 C34 38 38 44 46 44" stroke="#1E293B" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="34" y1="32" x2="42" y2="32" stroke="#1E293B" stroke-width="4"/>
    </svg>`,
    summaryFa: 'انطباق کالا با الزامات ایمنی، سلامت و حفاظت از محیط زیست اروپا.',
    descriptionFa: 'روی کالاهای باکیفیت و تحت لیسانس؛ ضامن ایمنی قطعات در برابر برق‌گرفتگی، اشعه مضر و خطرات فیزیکی است.',
    whereFa: 'لوازم بهداشتی برقی، تیغ‌های اصلاح تخصصی، عینک‌ها و محصولات کودک.',
    verificationFa: 'در نشان اصل CE، فاصله دو حرف متناسب با قطر دایره است (برخلاف نشان فیک China Export).'
  }
]
