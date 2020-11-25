import { MatFormFieldSchema } from '../schema';
import { FormArraySchema } from 'ng-form-factory';

type OptionMap<T> = T extends (infer I)[] 
? Partial<Record<Extract<I, string>, any>>
: Partial<Record<Extract<T, string>, any>>;

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
