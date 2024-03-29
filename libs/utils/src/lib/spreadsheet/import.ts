import { WorkBook, WorkSheet, utils, read } from 'xlsx';
import { GetKeys, GroupScope, StaticGroup, staticGroups, parseToAll, Scope } from '@blockframes/model';
import { ImportLog, mandatoryError, SpreadsheetImportError, WrongTemplateError, wrongValueWarning } from '@blockframes/import/utils';
import { getKeyIfExists } from '../helpers';

type Matrix = any[][]; // @todo find better type

type FromStatic<S extends Scope> = GetKeys<S>[] | ValueWithError<GetKeys<S>[]>;
export interface SheetTab {
  name: string;
  index: number;
  headers: any[];
  rows: any[][];
}
interface GroupedListOptions {
  required: boolean;
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

type ValueOrError<T, K> = DeepValue<T, K>;

type ParseFieldFn<T, K> = (value: string | string[], entity: any, state: any[], rowIndex?: number) =>
  ValueOrError<T, K> |
  Promise<ValueOrError<T, K>>;


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
async function parse<T>(
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
        const promises = value.map(v => {
          try {
            return transform(v, entity, state, rowIndex);
          } catch (err) {
            return Promise.resolve(err);
          }
        });
        const results = await Promise.all(promises);

        const validResults = results.filter(r => !isValueWithError(r));
        item[field] = validResults;

        const errorResults = results.filter(r => isValueWithError(r));
        errors.push(...errorResults);

      } else {
        // Creating array at this field to which will be pushed the other sub fields
        if (!item[field]) item[field] = new Array(value.length).fill(null).map(() => ({}));
        for (let index = 0; index < value.length; index++) {
          // Filling in objects into above created array
          try {
            await parse(state, entity, item[field][index], value[index], segments.join('.'), transform, rowIndex, errors);
          } catch (err) {
            return Promise.resolve(err);
          }
        }
      }
    } else {
      const value = Array.isArray(values) ? values[0] : values;
      if (last) {
        try {
          const result = await transform((`${value ?? ''}`).trim(), entity, state, rowIndex);
          item[segment] = result;
        } catch (err) {
          if (err instanceof WrongTemplateError)
            throw err; //stops the recursive looping of parse ie, the excelColumnLoop.
          errors.push(err);
        }
      } else {
        if (!item[segment]) item[segment] = {};
        await parse(state, entity, item[segment], values, segments.join('.'), transform, rowIndex, errors);
      }
    }
  } catch (err) {
    if (err instanceof WrongTemplateError)
      throw err;
    errors.push({
      type: 'error',
      name: 'Unexpected Error',
      reason: `An unexpected error has happened, please try again, and contact us if you keep seeing this. (${path})`,
      message: err,
    });
  }
}

export interface ValueWithError<T = unknown> {
  value: T;
  error: SpreadsheetImportError;
}

export interface ValueWithErrorSimple<T = unknown> extends SpreadsheetImportError {
  value: T;
}

function isValueWithError(o: unknown): boolean {
  return o instanceof ImportLog;
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

    /**
     *    Column A  |   column B     | c     |
     * --------------------------------------|
     * | row a,b,c  | column  index n| ..... |
     * |------------|----------------|-------|
     * |            | column  index 1| ..... |
     * |            |----------------|-------|
     * | row d,e,f  | column  index 2| ..... |
     * |            |----------------|-------|
     * |            | column  index 3| ..... |
     * --------------------------------------|
     */
    excelColumnLoop: for (let columnIndex = 0; columnIndex < entries.length; columnIndex++) {
      const [key, transform] = entries[columnIndex];
      const value = flatRows[rowIndex][columnIndex];
      try {
        await parse<T>(state, item, item, value, key, transform as ParseFieldFn<T, typeof key>, rowIndex, errors);
      } catch (err) {
        if (err instanceof WrongTemplateError) {
          errors.push(err.toJson());
          break excelColumnLoop;
        }
      }
    }
    const data = cleanUp(item) as T;
    state.push(data);
    results.push({
      data,
      errors: errors.filter(err => err)
    });
  }
  return results;
}

export function getStatic<S extends Scope>(scope: S, value: string, separator: string, name: string, allKey = 'all'): GetKeys<S>[] {
  if (!value) return [] as GetKeys<S>[];
  if (value.toLowerCase() === allKey) return parseToAll(scope, allKey);
  const splitted = split(value, separator);
  const keys = splitted.map(v => getKeyIfExists(scope, `${v}`));
  const values = keys.filter(v => !!v);
  if (values.length === keys.length) return values;
  const wrongData = splitted.filter(v => !v);
  if (wrongData.length) throw wrongValueWarning(values, name, wrongData);
  return values as GetKeys<S>[];
}

const isValueError = <S extends Scope>(values: FromStatic<S>): values is ValueWithError<GetKeys<S>[]> => {
  return (Array.isArray(values) && values.length === 0)
    || (values as ValueWithError<GetKeys<S>[]>).value?.length === 0;
}

export function getStaticList<S extends Scope>(scope: S, value: string, separator: string, name: string, mandatory = true, allKey = 'all'): GetKeys<S>[] {
  const values = getStatic(scope, value, separator, name, allKey);
  if (mandatory && isValueError(values)) throw mandatoryError<GetKeys<S>[]>(values, name);
  return values;
}

const fromGroup = {
  territories: (territories, separator, required: boolean) => getStaticList('territories', territories, separator, 'Territories', required, 'world'),
  medias: (medias, separator, required: boolean) => getStaticList('medias', medias, separator, 'Medias', required, 'all'),
}

export function getGroupedList(value: string, groupScope: 'territories', separator: string, options?: GroupedListOptions): GetKeys<'territories'>[];
export function getGroupedList(value: string, groupScope: 'medias', separator: string, options?: GroupedListOptions): GetKeys<'medias'>[];
export function getGroupedList<GS extends GroupScope>(value: string, groupScope: GS, separator: string, options = { required: true }) {
  const elements = split(value, separator);
  const groupLabels = staticGroups[groupScope].map(group => group.label);
  const allElements = elements.map(element => {
    return groupLabels.includes(element)
      ? (staticGroups[groupScope] as StaticGroup<GS>[]).find(group => group.label === element).items
      : element;
  }).flat();

  const elementList = Array.from(new Set(allElements)).join(separator);
  return fromGroup[groupScope](elementList, separator, options.required);
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
