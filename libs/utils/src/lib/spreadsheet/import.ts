import { SpreadsheetImportError } from 'libs/import/src/lib/utils';
import { WorkBook, WorkSheet, utils, read } from 'xlsx';
import { getKeyIfExists } from '../helpers';
import { parseToAll, Scope } from '../static-model';

type Matrix = any[][]; //@todo find better type

export interface SheetTab {
  name: string;
  index: number;
  headers: any[];
  rows: any[][];
}

type Join<K extends string, P extends string> = '' extends P ? K : `${K}.${P}`;
type GetKey<T, K extends Extract<keyof T, string>> =
  T[K] extends Array<infer I> ? K | `${K}[]` | Join<`${K}[]`, DeepKeys<I>>
  // eslint-disable-next-line @typescript-eslint/ban-types
  : T[K] extends Function ? never
  : K | Join<K, DeepKeys<T[K]>>;

type DeepKeys<T> = T extends Record<string, any>
  ? { [K in Extract<keyof T, string>]: GetKey<T, K> }[Extract<keyof T, string>]
  : '';

type DeepValue<T, K> =
  K extends `${infer I}[].${infer J}` ? I extends keyof T ? T[I] extends Array<infer Y> ? DeepValue<Y, J> : never : never
  : K extends `${infer I}.${infer J}` ? I extends keyof T ? DeepValue<T[I], J> : never
  : K extends `${infer I}[]` ? I extends keyof T ? T[I] extends Array<infer Y> ? Y : T[I] : never
  : K extends keyof T ? T[K] : never;


export type ParseFieldFn = (value: string | string[], item: any, state: any[], rowIndex?: number) => any | Promise<any>;
export type ExtractConfig<T> = Partial<{
  [key in DeepKeys<T>]: (value: string | string[], item: any, state: any[], rowIndex?: number) => DeepValue<T, key> | Promise<DeepValue<T, key>>;
}>

export interface ExtractOutput<T> {
  data: T,
  warnings: SpreadsheetImportError[],
  errors: SpreadsheetImportError[]
}


export function importSpreadsheet(bytes: Uint8Array, range?: string): SheetTab[] {

  // convert Uint8Array to binary String
  let bstr = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    bstr += String.fromCharCode(bytes[i]);
  }

  const workBook: WorkBook = read(bstr, { type: 'binary' });

  // For each tab
  const tabs: SheetTab[] = workBook.SheetNames.map((name, index) => {
    const worksheet: WorkSheet = workBook.Sheets[name];
    const rows = <Matrix>(utils.sheet_to_json(worksheet, { header: 1, range }));
    const headers = rows.shift();

    return { name, index, headers, rows } as SheetTab;
  });

  return tabs;
}


/**
 * @param state all previous entities
 * @param item current entity (Title, Org, Contract, ...)
 */
export async function parse(
  state: any[],
  item: any = {},
  values: string | string[],
  path: string,
  transform: ParseFieldFn,
  rowIndex: number,
  warnings: SpreadsheetImportError[],
  errors: SpreadsheetImportError[],
) {
  const segments = path.split('.');
  const segment = segments.shift();
  const last = !segments?.length;

  // Array field
  if (segment.endsWith('[]')) {
    const field = segment.replace('[]', '');
    if (Array.isArray(values)) {
      if (last) {
        const promises = values.map(value => transform(value, item, state, rowIndex));
        item[field] = await Promise.all(promises);
      } else {
        // Creating array at this field to which will be pushed the other sub fields
        if (!item[field]) item[field] = new Array(values.length).fill(null).map(() => ({}));
        for (let index = 0 ; index < values.length ; index++) {
          // Filling in objects into above created array
          await parse(state, item[field][index], values[index], segments.join('.'), transform, rowIndex, warnings, errors);
        }

      }
    }
  } else {
    const value = Array.isArray(values) ? values[0] : values; // ? when is this supposed to happen ?
    try {
      if (last) {
        const result = await transform(value, item, state, rowIndex);
        if (result instanceof ValueWithWarning) {
          warnings.push(result.warning);
          item[segment] = result.value;
        } else {
          item[segment] = result;
        }
      }
    } catch (err: any) {
      errors.push(err.message ? JSON.parse(err.message) : err.message);
    }

    if (!last) {
      if (!item[segment]) item[segment] = {};
      await parse(state, item[segment], values, segments.join('.'), transform, rowIndex, warnings, errors);
    }
  }
}

export class ValueWithWarning<T = any>{
  constructor(public value: T, public warning?: SpreadsheetImportError) { }
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

/**
 * This method assumes that the keys of extractParams doesn't posses number as this will throw
 * off the ordering of the elements when we call Object.values/ Object.keys / Object.entries.
 * with the fields including the numbers coming first no matter their position in the object.
 */
export async function extract<T>(rawRows: string[][], config: ExtractConfig<T> = {}, concurrentRow = 1): Promise<ExtractOutput<T>[]> {
  const results: ExtractOutput<T>[] = [];
  const state = [];

  const flatRows = flattenConcurrentRows(rawRows, concurrentRow);

  for (const row of flatRows) {
    const item = {};
    const warnings: SpreadsheetImportError[] = [];
    const errors: SpreadsheetImportError[] = [];
    const entries = Object.entries(config);
    for (let index = 0 ; index < entries.length ; index++) {
      const [ key, transform ] = entries[index];
      const value = row[index];
      await parse(state, item, value, key, transform as ParseFieldFn, index, warnings, errors)
    }
    const data = cleanUp(item) as T;
    state.push(data);
    results.push({ data, errors, warnings });
  }
  return results;
}

export function getStatic(scope: Scope, value: string, separator:string) {
  if (!value) return []
  if (value.toLowerCase() === 'all') return parseToAll(scope, 'all');
  return split(value,separator).map(v => getKeyIfExists(scope, v)).filter(v => !!v);
}

export function getStaticList(scope: Scope, value: string, separator:string, error?: SpreadsheetImportError) {
  const values = getStatic(scope, value, separator);
  if (error && !values.length) {
    return new ValueWithWarning(values, error);
  }
  return values;
}

export function split(cell: string, separator:string) {
  return cell.split(separator).filter(v => !!v).map(v => v.trim());
}

function flattenConcurrentRows(rawRows: string[][], concurrent: number) {

  const flattened: string[][][] = new Array(Math.ceil(rawRows.length / concurrent));

  for (let row = 0 ; row < rawRows.length ; row++) {
    const flattenRow = Math.floor(row / concurrent);
    if (!flattened[flattenRow]) flattened[flattenRow] = [];
    for (let column = 0 ; column < rawRows[row].length ; column++) {
      if (!flattened[flattenRow][column]) flattened[flattenRow].push([]);
      flattened[flattenRow][column].push(rawRows[row][column]);
    }
  }

  const filteredColumns = flattened.map(row => row.map(column => {
    const filteredValues = column.filter(value => !!value);
    if (!filteredValues.length) return undefined;
    if (filteredValues.length === 1) return filteredValues[0];
    return filteredValues;
  }));

  return filteredColumns.filter(row => !!row.length);
}
