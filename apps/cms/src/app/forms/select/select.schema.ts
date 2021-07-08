import { FormArraySchema, FormControlSchema } from 'ng-form-factory';
import { MatFormFieldSchema } from '../schema';

export type Options<T> = Record<string, T> | T[];


export interface MatSelectSchema<T> extends MatFormFieldSchema, FormControlSchema<T> {
  options?: Options<T>;
  multiple: false;
}

export function matSelect<T>(schema: Partial<MatSelectSchema<T>>): MatSelectSchema<T> {
  return {
    ...schema,
    form: 'control',
    multiple: false,
  };
}

export interface MatMultiSelectSchema<T> extends MatFormFieldSchema, FormArraySchema<T> {
  options?: Options<T>;
  multiple: true;
}


export function matMultiSelect<T>(schema: Partial<MatMultiSelectSchema<T>>): MatMultiSelectSchema<T> {
  return {
    controls: [],
    factory: () => ({ form: 'control' } as any),
    ...schema,
    form: 'array',
    multiple: true,
  };
}