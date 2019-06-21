import { ValidatorFn, AbstractControlOptions, AsyncValidatorFn } from "@angular/forms";

export type Validator = ValidatorFn | ValidatorFn[] | AbstractControlOptions | null;
export type AsyncValidator = AsyncValidatorFn | AsyncValidatorFn[] | null;
