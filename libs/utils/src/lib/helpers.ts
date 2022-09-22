import { staticModel, Scope, GetKeys, Organization } from '@blockframes/model';

function isObject(item: unknown) {
  return item && typeof item === 'object' && !Array.isArray(item) && item !== null;
}

/**
 * @dev this method is used to deeply merge two object without loosing data
 * Use this instead of { ...this.query.getActive(), ...this.form.value }
 * @param target
 * @param source
 */
export function mergeDeep<T>(target: T, source: Partial<T>): T {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else if (source[key] instanceof Date) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

/**
 * Get the value of an item based on a path
 * @example item = movie, key = 'budget.totalBudget'
 */
export function getValue(item: any, key: string) {
  const path = key.split('.');
  for (let i = 0; i < path.length; i++) {
    item = item?.[path[i]];
  }
  return item;
}

function findCorrespondence(code: string) {
  return ([key, value]: [string, string]) => key.toLowerCase() === code || value.toLowerCase() === code
}

/**
 * This function is used to check if a given value (code) belongs to a type (base).
 * Return the key of the const if found, undefined otherwise
 * @example
 * // Code example (string):
 * 'line_up' | 'Line-Up'
 *
 * // Base example (should exist in staticModel):
 * export const storeType = {
 *   library: 'Library',
 *   line_up: 'Line-Up',
 * } as const;
 *
 * getKeyIfExist('storeType', 'Line-Up'); // 'line-up'
 * getKeyIfExist('storeType', 'Test'); // undefined
 */
export function getKeyIfExists<S extends Scope>(base: S, code: string) {
  // Sanitized input to properly compare with base data
  const sanitizedCode = code.trim().toLowerCase();
  const candidate = Object.entries(staticModel[base])
    .find(findCorrespondence(sanitizedCode)) as [GetKeys<S>, string];
  return candidate ? candidate[0] : undefined;
}

/** Basic function to create a delay in a function when called
 * @param ms milleseconds to wait for
 */
export async function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function downloadCsvFromJson(data: unknown[], fileName = 'my-file') {
  const replacer = (_: unknown, value: unknown) => (value === null ? '' : value);
  const header = Object.keys(data[0]);
  const csv = data.map((row: unknown) =>
    header.map((fieldName) => {
      const value = row[fieldName];
      /**
       * escaping double quotes for correct csv
       * "I like "cookies" a lot" results in 3 columns: I like; cookies; a lot
       * "I like ""cookies"" a lot" results in 1 column: I like "cookies" a lot
       * 
       * Also escaping any new lines that could mess with CSV export
       */
      if (typeof value === 'string') return `"${value.replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, "")}"`;
      return JSON.stringify(value, replacer);
    }).join(',')
  );
  csv.unshift(header.map((h) => `"${h}"`).join(','));
  const csvArray = csv.join('\r\n');

  const a = document.createElement('a');
  const blob = new Blob([csvArray], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  a.href = url;
  a.download = `${fileName}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

/**
 * This high-order function create debounced functions, that can be continuously called,
 * but only executed once every `wait` period.
 * @note If you can work with observable, it's better to use rxjs `debounceTime` instead
 * @param func the function to debounce
 * @param wait the debounce duration in ms
 */
export function debounceFactory(func: (...params) => unknown, wait: number) {
  let timeout: number;

  return function executedFunction(...args) {
    const later = () => {
      window.clearTimeout(timeout);
      func(...args);
    };

    window.clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
}

/** Verify if the org exists and has a name. */
export function hasName(organization: Organization): boolean {
  return !!organization && !!organization.name;
}

export function capitalize(text: string) {
  return `${text[0].toUpperCase()}${text.substring(1)}`;
}

/** Returns only unique values from array of strings */
export function unique<T>(array: T[]) {
  return Array.from(new Set(array));
}

/**
 * Convert a number to time string
 * @param time In milliseconds
 */
export function convertToTimeString(time: number) {
  let hour: number, minute: number, second: number;

  second = Math.floor(time / 1000);
  minute = Math.floor(second / 60);
  second = second % 60;
  hour = Math.floor(minute / 60);
  minute = minute % 60;
  const day = Math.floor(hour / 24);
  hour = hour % 24;
  hour += day * 24;

  const dayStr = day > 0 ? `${day}d` : '';
  const hourStr = hour > 0 ? `${hour}h` : '';
  const minuteStr = minute > 0 ? `${minute}min` : '';
  const secondStr = second > 0 ? `${second}s` : '';

  return `${dayStr}${hourStr}${minuteStr}${secondStr}` || '0s';
}