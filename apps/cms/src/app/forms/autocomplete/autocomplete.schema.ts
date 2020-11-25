import { MatFormFieldSchema } from '../schema';
import { FormControlSchema, FormArraySchema } from 'ng-form-factory';

type OptionMap<T> = T extends (infer I)[] 
? Partial<Record<Extract<I, string>, any>>
: Partial<Record<Extract<T, string>, any>>;

export interface MatSelectSchema<T> extends FormControlSchema<T>, MatFormFieldSchema<T> {
  options?: OptionMap<T> | T[];
  multiple: false;
}

export interface MatMulitSelectSchema<T> extends FormArraySchema<T>, MatFormFieldSchema<T> {
  options?: OptionMap<T> | T[];
  multiple: true;
}


export function matMuliSelect<T>(schema: Partial<MatMulitSelectSchema<T>>): MatMulitSelectSchema<T> {
  return {
    controls: [],
    factory: () => ({ form: 'control' } as any),
    ...schema,
    form: 'array',
    multiple: true,
  };
}

export function matSelect<T>(schema: Partial<MatSelectSchema<T>>) {
  return {
    form: 'control',
    ...schema as Partial<MatSelectSchema<T>>,
    multiple: false,
  };
}