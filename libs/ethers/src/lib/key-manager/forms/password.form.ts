import { PasswordControl, EntityControl, EntityRulesForm } from '@blockframes/utils';

interface Password {
  password: string 
}

function createPassword(params?: Partial<Password>): Password {
  return {
    password: '',
    ...(params || {})
  } as Password
}

function createPasswordControls(entity: Partial<Password>): EntityControl<Password> {
  const create = createPassword(entity);
  return {
    password: new PasswordControl(create.password),
  }
}

export class PasswordForm extends EntityRulesForm<Password> {
  constructor(data?: Password) {
    super(createPasswordControls(data))
  }
}