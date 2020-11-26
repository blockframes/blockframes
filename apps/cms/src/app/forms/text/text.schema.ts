import { FormControlSchema } from 'ng-form-factory';
import { MatFormFieldSchema } from '../schema';


export interface MatTextSchema extends FormControlSchema, MatFormFieldSchema<string> {
  size: 'short' | 'long';
}

export const matText = (params: Partial<MatTextSchema> = {}): MatTextSchema => {
  return {
    form: 'control',
    type: 'text',
    size: 'short',
    ...params
  }
}
