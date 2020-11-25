import { MatFormFieldSchema } from '../schema';
import { FormControlSchema } from 'ng-form-factory';


export interface MatSelectSchema<T> extends FormControlSchema<T>, MatFormFieldSchema<T> {
  options?: Record<string, T>;
  multiple: false;
}

export function matSelect<T>(schema: Partial<MatSelectSchema<T>>): MatSelectSchema<T> {
  return {
    form: 'control',
    ...schema as Partial<MatSelectSchema<T>>,
    multiple: false,
  };
}