var DISPLAY_LOCALE = 'fa-IR-u-ca-persian';
var PARTS_LOCALE = 'en-u-ca-persian-nu-latn';

var MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

var dateTimeFormat = new Intl.DateTimeFormat(DISPLAY_LOCALE, { dateStyle: 'medium', timeStyle: 'short' });
var dateFormat = new Intl.DateTimeFormat(DISPLAY_LOCALE, { year: 'numeric', month: 'long', day: 'numeric' });
var shortFormat = new Intl.DateTimeFormat(DISPLAY_LOCALE, { month: 'short', day: 'numeric' });
var partsFormat = new Intl.DateTimeFormat(PARTS_LOCALE, { year: 'numeric', month: 'numeric', day: 'numeric' });
var yearFormat = new Intl.NumberFormat('fa-IR', { useGrouping: false });

export class JalaliDate {
  static dateTime(timestamp) {
    return dateTimeFormat.format(timestamp);
  }

  static date(timestamp) {
    return dateFormat.format(timestamp);
  }

  static short(timestamp) {
    return shortFormat.format(timestamp);
  }

  static parts(timestamp) {
    var result = {};
    partsFormat.formatToParts(timestamp).forEach(function (part) {
      if (part.type === 'year' || part.type === 'month' || part.type === 'day') {
        result[part.type] = Number(part.value);
      }
    });
    return result;
  }

  static monthIndex(timestamp) {
    var parts = JalaliDate.parts(timestamp);
    return parts.year * 12 + (parts.month - 1);
  }

  static monthLabel(monthIndex) {
    var year = Math.floor(monthIndex / 12);
    var month = monthIndex % 12;
    return MONTH_NAMES[month] + ' ' + yearFormat.format(year);
  }

  static monthName(monthIndex) {
    return MONTH_NAMES[monthIndex % 12];
  }
}
