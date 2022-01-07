import { FormControl, Validators } from "@angular/forms";
import { confirmPasswords, differentPassword, FormEntity, PasswordControl } from "@blockframes/utils/form";

function createIdentityFormControl() {

  return {
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', Validators.email),
    generatedPassword: new FormControl('', Validators.required),
    password: new PasswordControl(),
    confirm: new PasswordControl(),
    termsOfUse: new FormControl(false, Validators.requiredTrue),
    privacyPolicy: new FormControl(false, Validators.requiredTrue),
  }
}

export type IdentityFormControl = ReturnType<typeof createIdentityFormControl>;

export class IdentityForm extends FormEntity<IdentityFormControl> {
  constructor() {
    super(createIdentityFormControl(), { validators: [
      confirmPasswords('password', 'confirm'),
      differentPassword('generatedPassword', 'password')
    ]});
  }
}
