import { FormControl } from '@angular/forms';
import {
  yearValidators,
  ethereumPublicAddressValidators,
  ethereumPrivateAddressValidators,
  urlValidators,
  validMnemonic
} from './validators/validators';

/* Checks if input is a valid Ethereum private key */
export class EthereumPrivateKeyControl extends FormControl{
  constructor (value : string = '', disabled : boolean = false, validators? : any[]) {
    super({ value, disabled }, validators !== undefined ? validators : ethereumPrivateAddressValidators);
  }
}

/* Checks if input is a valid Ethereum public key */
export class EthereumPublicKeyControl extends FormControl{
  constructor (value : string = '', disabled : boolean = false, validators? : any[]) {
    super({ value, disabled }, validators !== undefined ? validators : ethereumPublicAddressValidators);
  }
}

/* Checks if input is a valid Ethereum Mnemonic */
export class EthereumMnemonicControl extends FormControl{
  constructor (value : string = '', disabled : boolean = false, validators? : any[]) {
    super({ value, disabled }, validators !== undefined ? validators : validMnemonic);
  }
}
