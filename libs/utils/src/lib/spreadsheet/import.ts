import { WorkBook, WorkSheet, utils, read}  from 'xlsx';

type Matrix = any[][]; //@todo find better type

export interface SheetTab {
  name: string;
  index: number;
  headers: any[];
  rows: any[][];
}

export type ParseFieldFn = (value: string | string[], state: any, rowIndex?: number) => any;

export function importSpreadsheet(bytes: Uint8Array, range? :string) : SheetTab[] {

  // convert Uint8Array to binary String
  let bstr = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    bstr += String.fromCharCode(bytes[i]);
  }

  const workBook: WorkBook = read(bstr, { type: 'binary' });

  // For each tab
  const tabs : SheetTab[] = workBook.SheetNames.map( (name, index)  => {
    const worksheet: WorkSheet = workBook.Sheets[name];
    const rows = <Matrix>(utils.sheet_to_json(worksheet, { header: 1, range }));
    const headers = rows.shift();

    return { name, index, headers, rows } as SheetTab;
  });

  return tabs;
}


/**
* item: The current object to return (contract, movie, org, ...)
* value: value of the cell (array of string if the cell has several lines)
* path: The key in the transform object (without the column segment)
* transform: the callback of the key
*/
export function parse(item: any = {}, values: string | string[], path: string, transform: ParseFieldFn, rowIndex: number) {
  // Here we assume the column section has already been removed from the path
  const segments = path.split('.');
  // const [segment, ...remainingSegments] = segments;
  const segment = segments.shift()
  const last = !segments?.length;
  if (segment.endsWith('[]')) {
    const field = segment.replace('[]', '');
    if (Array.isArray(values)) {
      //@TODO: transform should have state instead of item
      if (last) item[field] = values.map((value, index) => transform(value, item, rowIndex));
      if (!last) {
        if (!item[field]) item[field] = new Array(values.length).fill(null).map(() => ({}));
        values.forEach((value, index) => {
          parse(item[field][index], value, segments.join('.'), transform, rowIndex)
        })

      }
    }
  } else {
    const value = Array.isArray(values) ? values[0] : values
    if (last) {
      item[segment] = transform(value, item, rowIndex);
    }

    if (!last) item[segment] = parse(item[segment] || {}, values, segments.join('.'), transform, rowIndex);
  }
}

/**
 * Rids array attribs of superfluous
 * empty objects(objects whose elements are all empty) or elements
 * @param data data to clean up
 * @returns data less superfluous objects in arrays particularly
 */
export function cleanUp<T>(data: T) {
  if (!data) return;
  const cleanedData = {};
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      cleanedData[key] = value.filter(datum => {
        const response = !isEmpty(datum)
        return response;
      });
    } else {
      cleanedData[key] = value;
    }
  });
  return cleanedData as T;
}

//Deep search within arrays/objects if all attribs are contextually empty.
export function isEmpty(data: any,) {
  let response = false;
  if (Array.isArray(data)) {
    response = data.every(datum => isEmpty(datum));
  } else if (typeof data === 'object') {
    response = Object.values(data).every(value => isEmpty(value));
  } else {
    response = !data
  }

  return response;
}


export function extract<T>(rawRows: string[][], extractParams: Record<string, ParseFieldFn> = {}) {
  const extraParamsEntries = Object.entries(extractParams);
  const state = {};
  extraParamsEntries.forEach(([columnIndexedKey, parseFieldFn], index) => {
    const extraParamValues = rawRows.map(row => row[index] ?? '');
    parse(state, extraParamValues, columnIndexedKey, parseFieldFn, index)
  });
  return cleanUp(state as T)
}
