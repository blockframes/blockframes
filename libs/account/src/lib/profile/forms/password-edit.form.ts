import {
  EntityControl,
  PasswordControl,
  checkPasswords,
  FormEntity
} from '@blockframes/utils';
import { ValidatorFn } from '@angular/forms';

interface PasswordEdit {
  actualPassword: string
  password: string
  confirm: string
}

function createPasswordEdit(params?: Partial<PasswordEdit>): PasswordEdit {
  return {
    actualPassword: '',
    password: '',
    confirm: '',
    ...(params || {})
  } as PasswordEdit
}

function createPasswordEditControls(entity: Partial<PasswordEdit>): EntityControl<PasswordEdit> {
  const passwordEdit = createPasswordEdit(entity);
  return {
    actualPassword: new PasswordControl(passwordEdit.actualPassword),
    password: new PasswordControl(passwordEdit.password),
    confirm: new PasswordControl(passwordEdit.confirm),
  }
}

type PasswordEditControl = ReturnType<typeof createPasswordEditControls>;

function createPasswordEditValidators(validators?: any[]): ValidatorFn[]{
  if(validators && validators.length) {
    return validators;
  } else {
    return [checkPasswords()];
  }
}

export class PasswordEditForm extends FormEntity<PasswordEdit, PasswordEditControl> {
  constructor(data?: PasswordEdit, validators?: any[]) {
    super(
      createPasswordEditControls(data),
      createPasswordEditValidators(validators),
    )
  }
}
