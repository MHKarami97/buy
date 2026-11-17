/**
 * GS1 Country Prefix Database
 * ----------------------------
 * Mapping of international barcode prefixes (EAN-13 / GTIN) to origin countries and organizations.
 * Reference: GS1 General Specifications & Salamat Darou Iran (salamatdarou.com)
 */

export var GS1_PREFIX_TABLE = [
  { min: 0, max: 19, countryFa: 'ایالات متحده و کانادا', countryEn: 'United States & Canada', flag: '🇺🇸' },
  { min: 20, max: 29, countryFa: 'توزیع داخلی (فروشگاهی / محدود)', countryEn: 'In-store / Internal', flag: '🏪' },
  { min: 30, max: 39, countryFa: 'ایالات متحده (دارویی)', countryEn: 'United States (Drugs)', flag: '🇺🇸' },
  { min: 40, max: 49, countryFa: 'توزیع داخلی (محدود)', countryEn: 'Internal / Restricted', flag: '🏪' },
  { min: 50, max: 59, countryFa: 'کوپن‌ها', countryEn: 'Coupons', flag: '🎟️' },
  { min: 60, max: 139, countryFa: 'ایالات متحده و کانادا', countryEn: 'United States & Canada', flag: '🇺🇸' },
  { min: 200, max: 299, countryFa: 'توزیع داخلی (فروشگاهی)', countryEn: 'Internal / In-store', flag: '🏪' },
  { min: 300, max: 379, countryFa: 'فرانسه', countryEn: 'France', flag: '🇫🇷' },
  { min: 380, max: 380, countryFa: 'بلغارستان', countryEn: 'Bulgaria', flag: '🇧🇬' },
  { min: 383, max: 383, countryFa: 'اسلوونی', countryEn: 'Slovenia', flag: '🇸🇮' },
  { min: 385, max: 385, countryFa: 'کرواسی', countryEn: 'Croatia', flag: '🇭🇷' },
  { min: 387, max: 387, countryFa: 'بوسنی و هرزگوین', countryEn: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { min: 389, max: 389, countryFa: 'مونته‌نگرو', countryEn: 'Montenegro', flag: '🇲🇪' },
  { min: 400, max: 440, countryFa: 'آلمان', countryEn: 'Germany', flag: '🇩🇪' },
  { min: 450, max: 459, countryFa: 'ژاپن', countryEn: 'Japan', flag: '🇯🇵' },
  { min: 460, max: 469, countryFa: 'روسیه', countryEn: 'Russia', flag: '🇷🇺' },
  { min: 470, max: 470, countryFa: 'قرقیزستان', countryEn: 'Kyrgyzstan', flag: '🇰🇬' },
  { min: 471, max: 471, countryFa: 'تایوان', countryEn: 'Taiwan', flag: '🇹🇼' },
  { min: 474, max: 474, countryFa: 'استونی', countryEn: 'Estonia', flag: '🇪🇪' },
  { min: 475, max: 475, countryFa: 'لتونی', countryEn: 'Latvia', flag: '🇱🇻' },
  { min: 476, max: 476, countryFa: 'آذربایجان', countryEn: 'Azerbaijan', flag: '🇦🇿' },
  { min: 477, max: 477, countryFa: 'لیتوانی', countryEn: 'Lithuania', flag: '🇱🇹' },
  { min: 478, max: 478, countryFa: 'ازبکستان', countryEn: 'Uzbekistan', flag: '🇺🇿' },
  { min: 479, max: 479, countryFa: 'سری‌لانکا', countryEn: 'Sri Lanka', flag: '🇱🇰' },
  { min: 480, max: 480, countryFa: 'فیلیپین', countryEn: 'Philippines', flag: '🇵🇭' },
  { min: 481, max: 481, countryFa: 'بلاروس', countryEn: 'Belarus', flag: '🇧🇾' },
  { min: 482, max: 482, countryFa: 'اوکراین', countryEn: 'Ukraine', flag: '🇺🇦' },
  { min: 484, max: 484, countryFa: 'مولداوی', countryEn: 'Moldova', flag: '🇲🇩' },
  { min: 485, max: 485, countryFa: 'ارمنستان', countryEn: 'Armenia', flag: '🇦🇲' },
  { min: 486, max: 486, countryFa: 'گرجستان', countryEn: 'Georgia', flag: '🇬🇪' },
  { min: 487, max: 487, countryFa: 'قزاقستان', countryEn: 'Kazakhstan', flag: '🇰🇿' },
  { min: 488, max: 488, countryFa: 'تاجیکستان', countryEn: 'Tajikistan', flag: '🇹🇯' },
  { min: 489, max: 489, countryFa: 'هنگ کنگ', countryEn: 'Hong Kong', flag: '🇭🇰' },
  { min: 490, max: 499, countryFa: 'ژاپن', countryEn: 'Japan', flag: '🇯🇵' },
  { min: 500, max: 509, countryFa: 'انگلستان (بریتانیا)', countryEn: 'United Kingdom', flag: '🇬🇧' },
  { min: 520, max: 521, countryFa: 'یونان', countryEn: 'Greece', flag: '🇬🇷' },
  { min: 528, max: 528, countryFa: 'لبنان', countryEn: 'Lebanon', flag: '🇱🇧' },
  { min: 529, max: 529, countryFa: 'قبرس', countryEn: 'Cyprus', flag: '🇨🇾' },
  { min: 531, max: 531, countryFa: 'مقدونیه شمالی', countryEn: 'North Macedonia', flag: '🇲🇰' },
  { min: 535, max: 535, countryFa: 'مالت', countryEn: 'Malta', flag: '🇲🇹' },
  { min: 539, max: 539, countryFa: 'ایرلند', countryEn: 'Ireland', flag: '🇮🇪' },
  { min: 540, max: 549, countryFa: 'بلژیک و لوکزامبورگ', countryEn: 'Belgium & Luxembourg', flag: '🇧🇪' },
  { min: 560, max: 560, countryFa: 'پرتغال', countryEn: 'Portugal', flag: '🇵🇹' },
  { min: 569, max: 569, countryFa: 'ایسلند', countryEn: 'Iceland', flag: '🇮🇸' },
  { min: 570, max: 579, countryFa: 'دانمارک', countryEn: 'Denmark', flag: '🇩🇰' },
  { min: 590, max: 590, countryFa: 'لهستان', countryEn: 'Poland', flag: '🇵🇱' },
  { min: 594, max: 594, countryFa: 'رومانی', countryEn: 'Romania', flag: '🇷🇴' },
  { min: 599, max: 599, countryFa: 'مجارستان', countryEn: 'Hungary', flag: '🇭🇺' },
  { min: 600, max: 601, countryFa: 'آفریقای جنوبی', countryEn: 'South Africa', flag: '🇿🇦' },
  { min: 603, max: 603, countryFa: 'غنا', countryEn: 'Ghana', flag: '🇬🇭' },
  { min: 604, max: 604, countryFa: 'سنگال', countryEn: 'Senegal', flag: '🇸🇳' },
  { min: 608, max: 608, countryFa: 'بحرین', countryEn: 'Bahrain', flag: '🇧🇭' },
  { min: 609, max: 609, countryFa: 'موریس', countryEn: 'Mauritius', flag: '🇲🇺' },
  { min: 611, max: 611, countryFa: 'مراکش', countryEn: 'Morocco', flag: '🇲🇦' },
  { min: 613, max: 613, countryFa: 'الجزایر', countryEn: 'Algeria', flag: '🇩🇿' },
  { min: 615, max: 615, countryFa: 'نیجریه', countryEn: 'Nigeria', flag: '🇳🇬' },
  { min: 616, max: 616, countryFa: 'کنیا', countryEn: 'Kenya', flag: '🇰🇪' },
  { min: 618, max: 618, countryFa: 'ساحل عاج', countryEn: 'Ivory Coast', flag: '🇨🇮' },
  { min: 619, max: 619, countryFa: 'تونس', countryEn: 'Tunisia', flag: '🇹🇳' },
  { min: 620, max: 620, countryFa: 'تانزانیا', countryEn: 'Tanzania', flag: '🇹🇿' },
  { min: 621, max: 621, countryFa: 'سوریه', countryEn: 'Syria', flag: '🇸🇾' },
  { min: 622, max: 622, countryFa: 'مصر', countryEn: 'Egypt', flag: '🇪🇬' },
  { min: 624, max: 624, countryFa: 'لیبی', countryEn: 'Libya', flag: '🇱🇾' },
  { min: 625, max: 625, countryFa: 'اردن', countryEn: 'Jordan', flag: '🇯🇴' },
  { min: 626, max: 626, countryFa: 'ایران', countryEn: 'Iran', flag: '🇮🇷', isIran: true },
  { min: 627, max: 627, countryFa: 'کویت', countryEn: 'Kuwait', flag: '🇰🇼' },
  { min: 628, max: 628, countryFa: 'عربستان سعودی', countryEn: 'Saudi Arabia', flag: '🇸🇦' },
  { min: 629, max: 629, countryFa: 'امارات متحده عربی', countryEn: 'United Arab Emirates', flag: '🇦🇪' },
  { min: 630, max: 630, countryFa: 'قطر', countryEn: 'Qatar', flag: '🇶🇦' },
  { min: 640, max: 649, countryFa: 'فنلاند', countryEn: 'Finland', flag: '🇫🇮' },
  { min: 690, max: 699, countryFa: 'چین', countryEn: 'China', flag: '🇨🇳' },
  { min: 700, max: 709, countryFa: 'نروژ', countryEn: 'Norway', flag: '🇳🇴' },
  { min: 729, max: 729, countryFa: 'اسرائیل', countryEn: 'Israel', flag: '🇮🇱' },
  { min: 730, max: 739, countryFa: 'سوئد', countryEn: 'Sweden', flag: '🇸🇪' },
  { min: 740, max: 740, countryFa: 'گواتمالا', countryEn: 'Guatemala', flag: '🇬🇹' },
  { min: 741, max: 741, countryFa: 'السالوادور', countryEn: 'El Salvador', flag: '🇸🇻' },
  { min: 742, max: 742, countryFa: 'هندوراس', countryEn: 'Honduras', flag: '🇭🇳' },
  { min: 743, max: 743, countryFa: 'نیکاراگوئه', countryEn: 'Nicaragua', flag: '🇳🇮' },
  { min: 744, max: 744, countryFa: 'کاستاریکا', countryEn: 'Costa Rica', flag: '🇨🇷' },
  { min: 745, max: 745, countryFa: 'پاناما', countryEn: 'Panama', flag: '🇵🇦' },
  { min: 746, max: 746, countryFa: 'جمهوری دومینیکن', countryEn: 'Dominican Republic', flag: '🇩🇴' },
  { min: 750, max: 750, countryFa: 'مکزیک', countryEn: 'Mexico', flag: '🇲🇽' },
  { min: 754, max: 755, countryFa: 'کانادا', countryEn: 'Canada', flag: '🇨🇦' },
  { min: 759, max: 759, countryFa: 'ونزوئلا', countryEn: 'Venezuela', flag: '🇻🇪' },
  { min: 760, max: 769, countryFa: 'سوئیس', countryEn: 'Switzerland', flag: '🇨🇭' },
  { min: 770, max: 771, countryFa: 'کلمبیا', countryEn: 'Colombia', flag: '🇨🇴' },
  { min: 773, max: 773, countryFa: 'اروگوئه', countryEn: 'Uruguay', flag: '🇺🇾' },
  { min: 775, max: 775, countryFa: 'پرو', countryEn: 'Peru', flag: '🇵🇪' },
  { min: 777, max: 777, countryFa: 'بولیوی', countryEn: 'Bolivia', flag: '🇧🇴' },
  { min: 778, max: 779, countryFa: 'آرژانتین', countryEn: 'Argentina', flag: '🇦🇷' },
  { min: 780, max: 780, countryFa: 'شیلی', countryEn: 'Chile', flag: '🇨🇱' },
  { min: 784, max: 784, countryFa: 'پاراگوئه', countryEn: 'Paraguay', flag: '🇵🇾' },
  { min: 786, max: 786, countryFa: 'اکوادور', countryEn: 'Ecuador', flag: '🇪🇨' },
  { min: 789, max: 790, countryFa: 'برزیل', countryEn: 'Brazil', flag: '🇧🇷' },
  { min: 800, max: 839, countryFa: 'ایتالیا', countryEn: 'Italy', flag: '🇮🇹' },
  { min: 840, max: 849, countryFa: 'اسپانیا', countryEn: 'Spain', flag: '🇪🇸' },
  { min: 850, max: 850, countryFa: 'کوبا', countryEn: 'Cuba', flag: '🇨🇺' },
  { min: 858, max: 858, countryFa: 'اسلواکی', countryEn: 'Slovakia', flag: '🇸🇰' },
  { min: 859, max: 859, countryFa: 'جمهوری چک', countryEn: 'Czech Republic', flag: '🇨🇿' },
  { min: 860, max: 860, countryFa: 'صربستان', countryEn: 'Serbia', flag: '🇷🇸' },
  { min: 865, max: 865, countryFa: 'مغولستان', countryEn: 'Mongolia', flag: '🇲🇳' },
  { min: 867, max: 867, countryFa: 'کره شمالی', countryEn: 'North Korea', flag: '🇰🇵' },
  { min: 868, max: 869, countryFa: 'ترکیه', countryEn: 'Turkey', flag: '🇹🇷' },
  { min: 870, max: 879, countryFa: 'هلند', countryEn: 'Netherlands', flag: '🇳🇱' },
  { min: 880, max: 880, countryFa: 'کره جنوبی', countryEn: 'South Korea', flag: '🇰🇷' },
  { min: 884, max: 884, countryFa: 'کامبوج', countryEn: 'Cambodia', flag: '🇰🇭' },
  { min: 885, max: 885, countryFa: 'تایلند', countryEn: 'Thailand', flag: '🇹🇭' },
  { min: 888, max: 888, countryFa: 'سنگاپور', countryEn: 'Singapore', flag: '🇸🇬' },
  { min: 890, max: 890, countryFa: 'هند', countryEn: 'India', flag: '🇮🇳' },
  { min: 893, max: 893, countryFa: 'ویتنام', countryEn: 'Vietnam', flag: '🇻🇳' },
  { min: 896, max: 896, countryFa: 'پاکستان', countryEn: 'Pakistan', flag: '🇵🇰' },
  { min: 899, max: 899, countryFa: 'اندونزی', countryEn: 'Indonesia', flag: '🇮🇩' },
  { min: 900, max: 919, countryFa: 'اتریش', countryEn: 'Austria', flag: '🇦🇹' },
  { min: 930, max: 939, countryFa: 'استرالیا', countryEn: 'Australia', flag: '🇦🇺' },
  { min: 940, max: 949, countryFa: 'نیوزیلند', countryEn: 'New Zealand', flag: '🇳🇿' },
  { min: 950, max: 950, countryFa: 'دفتر مرکزی سازمان جهانی GS1', countryEn: 'GS1 Global Office', flag: '🌐' },
  { min: 955, max: 955, countryFa: 'مالزی', countryEn: 'Malaysia', flag: '🇲🇾' },
  { min: 958, max: 958, countryFa: 'ماکائو', countryEn: 'Macau', flag: '🇲🇴' },
  { min: 977, max: 977, countryFa: 'پیاپی‌ها و نشریات (ISSN)', countryEn: 'ISSN (Serials)', flag: '📰' },
  { min: 978, max: 979, countryFa: 'کتاب‌ها (شابک / ISBN)', countryEn: 'ISBN (Books)', flag: '📚' },
  { min: 980, max: 980, countryFa: 'رسیدها و استرداد کالا', countryEn: 'Refund receipts', flag: '🧾' },
  { min: 981, max: 984, countryFa: 'کوپن‌های ارزی عمومی', countryEn: 'Common Currency Coupons', flag: '🎟️' },
  { min: 990, max: 999, countryFa: 'کوپن‌ها و بن‌ها', countryEn: 'Coupons', flag: '🎟️' }
]

/**
 * Well-known Iranian company prefixes under GS1 Iran (626)
 */
export var IRAN_COMPANY_PREFIXES = [
  { prefix: '626012', name: 'کاله / سولیکو', category: 'لبنیات و پروتئین' },
  { prefix: '626011', name: 'سولیکو / گوشت‌آوران', category: 'فرآورده‌های پروتئینی' },
  { prefix: '626014', name: 'میهن', category: 'لبنیات و بستنی' },
  { prefix: '626015', name: 'میهن', category: 'لبنیات و بستنی' },
  { prefix: '626002', name: 'صنایع شیر ایران (پگاه)', category: 'لبنیات' },
  { prefix: '626001', name: 'گروه صنعتی مینو', category: 'شیرینی و بیسکویت' },
  { prefix: '626008', name: 'پاکبان / پاک', category: 'لبنیات' },
  { prefix: '626028', name: 'لبنیات چوپان', category: 'لبنیات' },
  { prefix: '626034', name: 'صنایع غذایی گلستان', category: 'چای، برنج و حبوبات' },
  { prefix: '626055', name: 'صنایع غذایی مهرام', category: 'سس، ترشی و چاشنی' },
  { prefix: '626048', name: 'زر ماکارون', category: 'ماکارونی و پاستا' },
  { prefix: '626065', name: 'صنایع غذایی دلپذیر', category: 'سس، کنسرو و کنسروجات' },
  { prefix: '626077', name: 'عالیس / سن‌ایچ', category: 'آبمیوه و نوشیدنی' },
  { prefix: '626088', name: 'چی‌توز (صنایع غذایی دینا)', category: 'اسنک، چیپس و پفک' },
  { prefix: '626090', name: 'مزمز', category: 'چیپس، پفک و تنقلات' },
  { prefix: '626105', name: 'شکلات فرمند', category: 'شکلات، پودر کیک و ژله' },
  { prefix: '626123', name: 'تبرک', category: 'رب، روغن و کنسرو' },
  { prefix: '626145', name: 'گروه صنعتی گلرنگ (اوه / سافتلن)', category: 'شوینده و بهداشتی' },
  { prefix: '626160', name: 'صنایع بهداشتی صحت', category: 'شامپو و شوینده بهداشتی' },
  { prefix: '626175', name: 'گروه صنعتی تاژ', category: 'مواد شوینده و پاک‌کننده' },
  { prefix: '626200', name: 'صنایع دارویی و بهداشتی کشور', category: 'دارو و مکمل سلامت' }
]

/**
 * Normalizes barcode string by removing spaces and dashes
 * and converting Arabic/Persian digits to English.
 * @param {string} code
 * @returns {string}
 */
export function normalizeBarcode(code) {
  if (!code) return ''
  var cleaned = String(code).trim().replace(/[\s-]/g, '')
  // Convert Persian/Arabic digits
  var persianDigits = '۰۱۲۳۴۵۶۷۸۹'
  var arabicDigits = '٠١٢٣٤٥٦٧٨٩'
  var normalized = ''
  for (var i = 0; i < cleaned.length; i++) {
    var char = cleaned[i]
    var pIdx = persianDigits.indexOf(char)
    var aIdx = arabicDigits.indexOf(char)
    if (pIdx !== -1) {
      normalized += String(pIdx)
    } else if (aIdx !== -1) {
      normalized += String(aIdx)
    } else {
      normalized += char
    }
  }
  return normalized
}

/**
 * Looks up the country from barcode prefix
 * @param {string} code
 * @returns {{ countryFa: string, countryEn: string, flag: string, prefix: number, isIran: boolean } | null}
 */
export function lookupGs1Country(code) {
  var digits = normalizeBarcode(code)
  if (!digits || !/^\d+$/.test(digits)) return null

  // If 12-digit UPC-A, pad left with 0 to make standard 13-digit EAN-13
  if (digits.length === 12) {
    digits = '0' + digits
  }

  // Must have at least 3 digits to check GS1 prefix
  if (digits.length < 3) return null

  var prefix3 = parseInt(digits.slice(0, 3), 10)

  for (var entry of GS1_PREFIX_TABLE) {
    if (prefix3 >= entry.min && prefix3 <= entry.max) {
      return {
        countryFa: entry.countryFa,
        countryEn: entry.countryEn,
        flag: entry.flag,
        prefix: prefix3,
        isIran: Boolean(entry.isIran)
      }
    }
  }

  return null
}

/**
 * Looks up well-known Iranian manufacturer if the barcode is Iranian (626)
 * @param {string} code
 * @returns {{ name: string, category: string } | null}
 */
export function lookupIranianCompany(code) {
  var digits = normalizeBarcode(code)
  if (!digits || !digits.startsWith('626')) return null

  for (var comp of IRAN_COMPANY_PREFIXES) {
    if (digits.startsWith(comp.prefix)) {
      return { name: comp.name, category: comp.category }
    }
  }

  return null
}

/**
 * Parses TTAC (Iranian Ministry of Health Food & Drug Organization tracking labels)
 * Common formats:
 * - Datamatrix / QR: (01)GTIN(21)UID(10)LOT(17)EXP
 * - Or raw string with UID / GTIN identifiers
 * @param {string} code
 * @returns {{ isTtac: boolean, gtin?: string, uid?: string, lot?: string, exp?: string } | null}
 */
export function parseTtacCode(code) {
  if (!code) return null
  var text = String(code).trim()

  // Match AI (01) GTIN and (21) UID
  var gtinMatch = text.match(/\(01\)(\d{14})/i) || text.match(/01(\d{14})21([A-Za-z0-9]+)/i)
  var uidMatch = text.match(/\(21\)([A-Za-z0-9]+)/i)
  var lotMatch = text.match(/\(10\)([A-Za-z0-9]+)/i)
  var expMatch = text.match(/\(17\)(\d{6})/i)

  if (gtinMatch || uidMatch || text.includes('ttac.ir')) {
    return {
      isTtac: true,
      gtin: gtinMatch ? (gtinMatch[1] || gtinMatch[0]) : null,
      uid: uidMatch ? uidMatch[1] : (gtinMatch && gtinMatch[2] ? gtinMatch[2] : null),
      lot: lotMatch ? lotMatch[1] : null,
      exp: expMatch ? expMatch[1] : null,
      checkUrl: 'https://ttac.ir'
    }
  }

  return null
}
