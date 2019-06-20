import {
  EntityControl,
  EntityRulesForm,
  PasswordControl,
  checkPasswords }
from '@blockframes/utils';
import { ValidatorFn } from '@angular/forms';

interface Create {
  password: string 
  confirm: string
}

function createCreate(params?: Partial<Create>): Create {
  return {
    password: '',
    confirm: '',
    ...(params || {})
  } as Create
}

function createCreateControls(entity: Partial<Create>): EntityControl<Create> {
  const create = createCreate(entity);
  return {
    password: new PasswordControl(create.password),
    confirm: new PasswordControl(create.confirm),
  }
}

function createCreateValidators(validators?: any[]): ValidatorFn[]{
  if(validators && validators.length) {
    return validators;
  } else {
    return [checkPasswords()];
  }
}

export class CreateForm extends EntityRulesForm<Create> {
  constructor(data?: Create, validators?: any[]) {
    super(
      createCreateControls(data),
      createCreateValidators(validators),
    )
  }
}

