import { UntypedFormControl, Validators } from "@angular/forms";
import { confirmPasswords, differentPassword, FormEntity, PasswordControl } from "@blockframes/utils/form";

function createIdentityFormControl() {

  return {
    firstName: new UntypedFormControl('', Validators.required),
    lastName: new UntypedFormControl('', Validators.required),
    email: new UntypedFormControl('', Validators.email),
    generatedPassword: new UntypedFormControl('', Validators.required),
    password: new PasswordControl(),
    confirm: new PasswordControl(),
    termsOfUse: new UntypedFormControl(false, Validators.requiredTrue),
    privacyPolicy: new UntypedFormControl(false, Validators.requiredTrue),
    hideEmail: new UntypedFormControl(false)
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
