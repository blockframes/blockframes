import { FormControl, FormGroup, FormArray } from "@angular/forms";
import { rules } from "./validators/rules";

// Generic Control 
export type EntityControl<T> = {
  [key in keyof T]: FormControl | FormArray | FormGroup
}

// Generic Entities
export class EntityForm<T> extends FormGroup {
  constructor(controls: EntityControl<T>, validators?: any) {
    super(controls, validators)
  }
}

export class EntityRulesForm<T> extends EntityForm<T> {
  public validatorsRules = rules;
  
  constructor(controls: EntityControl<T>, validators?: any) {
    super(controls, validators)
  }

  public getValidatorRules (ruleName: string) {
    return this.validatorsRules[ruleName];
  }
}