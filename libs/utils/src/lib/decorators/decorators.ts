import {
    coerceBooleanProperty,
/*     coerceArray as coerceArrayProperty,
    coerceCssPixelValue,
    coerceElement as coerceElementProperty,
    coerceNumberProperty */
} from "@angular/cdk/coercion";

import { coerce } from './boolean.decorator';

export const boolean = coerce(coerceBooleanProperty);
/* export const booleanArray = coerce(coerceArrayProperty);
export const booleanPixel = coerce(coerceCssPixelValue);
export const booleanElement = coerce(coerceElementProperty);
export const booleanNumber = coerce(coerceNumberProperty); */