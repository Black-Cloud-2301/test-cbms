export const parseDateFromString = (
  dateStr: string,
  format: 'DD/MM/YYYY' | 'DD/MM/YYYY HH:mm' = 'DD/MM/YYYY'
): Date | null => {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const [datePart, timePart] = dateStr.trim().split(' ');

  const [day, month, year] = datePart.split('/').map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  let hours = 0, minutes = 0;
  if (format === 'DD/MM/YYYY HH:mm') {
    if (!timePart) return null;
    [hours, minutes] = timePart.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
  }

  return new Date(year, month - 1, day, hours, minutes);
};

export const formatDateToString = (
  date: Date,
  format: string = 'DD/MM/YYYY'
): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';

  const pad = (num: number) => num.toString().padStart(2, '0');

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1); // Month is zero-based
  const year = date.getFullYear().toString();

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return format.replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', second);
};

export const getDateFormatRegex = (format: string): RegExp => {
  switch (format) {
    case 'DD/MM/YYYY':
      return /^\d{2}\/\d{2}\/\d{4}$/;

    case 'DD/MM/YYYY HH:mm':
      return /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;

    default:
      throw new Error(`⛔ Unsupported date format: ${format}`);
  }
};
