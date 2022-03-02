
import { WorkBook, WorkSheet, utils, read } from 'xlsx';
import { GetKeys, GroupScope, StaticGroup, staticGroups } from '@blockframes/utils/static-model';
import { mandatoryError, SpreadsheetImportError } from 'libs/import/src/lib/utils';
import { getKeyIfExists } from '../helpers';
import { parseToAll, Scope } from '../static-model';

type Matrix = any[][]; // @todo find better type
interface ImportError<S extends Scope> {
  value: GetKeys<S>[],
  error: {
    type: 'warning',
    name: string,
    reason: string,
    hint: string
  }
}

type FromStatic<S extends Scope> = GetKeys<S>[] | ImportError<S>;
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

type ValueOrError<T, K> = DeepValue<T, K> | ValueWithError<DeepValue<T, K>>;

export type ParseFieldFn<T, K> = (value: string | string[], entity: any, state: any[], rowIndex?: number) =>
  ValueOrError<T, K> |
  Promise<ValueOrError<T, K>>
  ;
export type ExtractConfig<T> = Partial<{
  [key in DeepKeys<T>]: (value: string | string[], entity: any, state: any[], rowIndex?: number) =>
    ValueOrError<T, key> |
    Promise<ValueOrError<T, key>>;
}>

export interface ExtractOutput<T> {
  data: T,
  errors: SpreadsheetImportError[]
}


export function importSpreadsheet(bytes: Uint8Array, range?: string): SheetTab[] {

  // convert Uint8Array to binary String
  let bstr = '';
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
export async function parse<T>(
  state: any[],
  entity: any = {},
  item: any = {},
  values: string | string[],
  path: string,
  transform: ParseFieldFn<T, typeof path>,
  rowIndex: number,
  errors: SpreadsheetImportError[],
) {
  try {
    const segments = path.split('.');
    const segment = segments.shift();
    const last = !segments?.length;

    // Array field
    if (segment.endsWith('[]')) {
      const field = segment.replace('[]', '');
      const value = Array.isArray(values) ? values : [values];
      if (last) {
        const promises = value.map(v => transform(v, entity, state, rowIndex));
        const results = await Promise.all(promises);

        const validResults = results.filter(r => !isValueWithError(r));
        item[field] = validResults;

        const errorResults = results.filter(r => isValueWithError(r)) as ValueWithError[];
        errors.push(...errorResults.map(e => e.error));
        item[field].push(...errorResults.map(e => e.value));

      } else {
        // Creating array at this field to which will be pushed the other sub fields
        if (!item[field]) item[field] = new Array(value.length).fill(null).map(() => ({}));
        for (let index = 0; index < value.length; index++) {
          // Filling in objects into above created array
          await parse(state, entity, item[field][index], value[index], segments.join('.'), transform, rowIndex, errors);
        }
      }
    } else {
      const value = Array.isArray(values) ? values[0] : values;
      if (last) {
        const result = await transform((`${value ?? ''}`).trim(), entity, state, rowIndex);
        if (isValueWithError(result)) {
          errors.push(result.error);
          item[segment] = result.value;
        } else {
          item[segment] = result;
        }
      } else {
        if (!item[segment]) item[segment] = {};
        await parse(state, entity, item[segment], values, segments.join('.'), transform, rowIndex, errors);
      }
    }
  } catch (err) {
    errors.push({
      type: 'error',
      name: 'Unexpected Error',
      reason: `An unexpected error as happened, please try again, and contact us if you keep seeing this. (${path})`,
      hint: err,
    });
  }
}

export interface ValueWithError<T = unknown> {
  value: T;
  error: SpreadsheetImportError;
}

function isValueWithError(o: unknown): o is ValueWithError {
  return typeof o === 'object' && ('value' in o) && ('error' in o);
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
  } else if (typeof data === 'object' && !!data) { // ! ->  typeof null === 'object'
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

  for (let rowIndex = 0; rowIndex < flatRows.length; rowIndex++) {
    const item = {};
    const errors: SpreadsheetImportError[] = [];
    const entries = Object.entries(config);
    for (let columnIndex = 0; columnIndex < entries.length; columnIndex++) {
      const [key, transform] = entries[columnIndex];
      const value = flatRows[rowIndex][columnIndex];
      await parse<T>(state, item, item, value, key, transform as ParseFieldFn<T, typeof key>, rowIndex, errors)
    }
    const data = cleanUp(item) as T;
    state.push(data);
    results.push({ data, errors });
  }
  return results;
}

export function getStatic<S extends Scope>(scope: S, value: string, separator: string, name: string, allKey = 'all'): FromStatic<S> {
  if (!value) return [] as GetKeys<S>[];
  if (value.toLowerCase() === allKey) return parseToAll(scope, allKey);
  const splitted = split(value, separator);
  const keys = splitted.map(v => getKeyIfExists(scope, `${v}`));
  const values = keys.filter(v => !!v);
  const wrongData: string[] = [];
  keys.forEach((k, i) => {
    if (!k) wrongData.push(`${splitted[i]}`);
  });
  if (wrongData.length) return {
    value: values, error: {
      type: 'warning',
      name: `Wrong ${name}`,
      reason: `Be careful, ${wrongData.length} values were wrong and will be omitted.`,
      hint: `${wrongData.slice(0, 3).join(', ')}...`
    }
  };
  return values as GetKeys<S>[];
}

const isValueError = <S extends Scope>(values: FromStatic<S>): values is ImportError<S> => {
  return ('length' in values && values.length === 0)
    || ('value' in values && values.value.length === 0)
}

export function getStaticList<S extends Scope>(scope: S, value: string, separator: string, name: string, mandatory = true, allKey = 'all') {
  const values = getStatic(scope, value, separator, name, allKey);
  if (mandatory && isValueError(values)) return mandatoryError<GetKeys<S>>(name);
  return values;
}

export function getGroupedList(value: string, groupScope: 'territories', separator: string): GetKeys<'territories'>[];
export function getGroupedList(value: string, groupScope: 'medias', separator: string): GetKeys<'medias'>[];
export function getGroupedList<GS extends GroupScope>(value: string, groupScope: GS, separator: string) {
  const elements = split(value, separator);
  const groupLabels = staticGroups[groupScope].map(group => group.label);
  let allElements = elements.map(element => {
    if (groupLabels.includes(element)) {
      const groups = staticGroups[groupScope] as StaticGroup<GS>[]
      return groups.find(group => group.label === element).items;
    }
    return [element];
  }).flat()

  allElements = Array.from(new Set(allElements));
  const elementList = allElements.join(separator);

  const values = {
    territories: (territories, separator) => getStaticList('territories', territories, separator, 'Territories', true, 'world'),
    medias: (medias, separator) => getStaticList('medias', medias, separator, 'Medias', true, 'all'),
  }
  return values[groupScope](elementList, separator);
}

export function split(cell: string, separator: string) {
  return cell.split(separator).filter(v => !!v).map(v => v.trim());
}

/**
 * Some excel import template let the users use several lines a single entity,
 * (_e.g. 10 lines per movie_) this function will take the raw data array form the import
 * and will flatten it so that one entity equal one line. This will create arrays in some columns.
 * @param rawRows raw data from excel import
 * @param concurrent number of lines per entity
 * @example
 * const rawMovies = [
 *  ['Harry Potter', 'France'], // Movie 1
 *  [undefined, 'Germany'],
 *  [undefined, 'UK'],
 *  ['Jurassic Park', 'USA'], // Movie 2
 * ];
 * const flattenedMovies = flattenConcurrentRows(rawMovies, 3);
 * // flattenedMovies will look like this
 * const flattenedMovies = [
 *   [ 'Harry Potter', [ 'France', 'Germany', 'UK' ] ],
 *   [ 'Jurassic Park', 'USA' ],
 * ];
 */
function flattenConcurrentRows(rawRows: string[][], concurrent: number) {

  // initializing the result array with the correct number of (undefined) entities
  const flattened: string[][][] = new Array(Math.ceil(rawRows.length / concurrent));

  // copy the raw (source) array into the flattened (destination) array,
  // every concurrent row of the source is merged into a single row of the destination
  for (let row = 0; row < rawRows.length; row++) {
    const flattenRow = Math.floor(row / concurrent);
    if (!flattened[flattenRow]) flattened[flattenRow] = [];
    for (let column = 0; column < rawRows[row].length; column++) {
      if (!flattened[flattenRow][column]) flattened[flattenRow].push([]);
      flattened[flattenRow][column].push(rawRows[row][column]);
    }
  }

  // Now that the array is flattened, we need to clean it as it contain a lot of undefined and empty arrays
  const filtered = flattened.map(row => { // for each row
    return row.map(column => { // for each column

      // remove undefined, transform empty arrays into undefined, and transform single element array into regular values
      const filteredValues = column.filter(value => !!value);
      if (!filteredValues.length) return undefined;
      if (filteredValues.length === 1) return filteredValues[0];
      return filteredValues;

    });
  });

  // Remove empty lines and return
  return filtered.filter(row => !!row.length);
}
