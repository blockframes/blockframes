import {
  PasswordControl,
  checkPasswords,
  requireMnemonicXorPrivateKey,
  EntityControl,
  EthereumMnemonicControl,
  EthereumPrivateKeyControl,
  FormEntity
} from '@blockframes/utils';
import { ValidatorFn } from '@angular/forms';

interface Recover {
  privateKey: string
  mnemonic: string
  password: string
  confirm: string
}

function createRecover(params?: Partial<Recover>): Recover {
  return {
    privateKey: '',
    mnemonic: '',
    password: '',
    confirm: '',
    ...(params || {})
  } as Recover
}

function createRecoverControls(entity: Partial<Recover>): EntityControl<Recover> {
  const recover = createRecover(entity);
  return {
    privateKey: new EthereumPrivateKeyControl(recover.privateKey),
    mnemonic: new EthereumMnemonicControl(recover.mnemonic),
    password: new PasswordControl(recover.password),
    confirm: new PasswordControl(recover.confirm),
  }
}

type RecoverControl = ReturnType<typeof createRecoverControls>;

function createRecoverValidators(validators?: any[]): ValidatorFn[]{
  if(validators && validators.length) {
    return validators;
  } else {
    return [checkPasswords(), requireMnemonicXorPrivateKey];
  }
}

export class RecoverForm extends FormEntity<Recover, RecoverControl> {
  constructor(data?: Recover, validators?: any[]) {
    super(
      createRecoverControls(data),
      createRecoverValidators(validators),
    )
  }
}
