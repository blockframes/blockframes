import { FormControlSchema } from 'ng-form-factory';
import { MatFormFieldAppearance, FloatLabelType } from '@angular/material/form-field';

export interface MatFormFieldSchema<T> {
  type: 'text' | 'number' | 'date';
  label?: string;
  suffix?: string;
  placeholder?: string;
  errors?: Record<string, string>
  hint?: string;
  value?: T
  /** Possible appearance styles for the form field. */
  appearance?: MatFormFieldAppearance;
  /** Whether the label for form-fields should by default float always, never, or auto (only when necessary). */
  floatLabel?: FloatLabelType;
  hideRequiredMarker?: boolean;
}


export interface MatTextSchema extends FormControlSchema, MatFormFieldSchema<string> {
  size: 'short' | 'long';
}

export const matText = (params: Partial<MatTextSchema>): MatTextSchema => {
  return {
    form: 'control',
    type: 'text',
    size: 'short',
    load: () => import('./text.component').then(c => c.TextFormComponent),
    ...(params || {})
  }
}
