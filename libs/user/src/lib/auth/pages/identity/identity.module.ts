import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { SigninFormModule } from '../../components/signin-form/signin-form.module';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';

// Component
import { IdentityComponent } from './identity.component';
import { TermsConditionsModule } from '@blockframes/auth/components/terms-conditions/terms-conditions.module';
import { AcceptConditionsModule } from '@blockframes/auth/components/accept-conditions/accept-conditions.module';
import { PrivacyPolicyModule } from '@blockframes/auth/components/privacy-policy/privacy-policy.module';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module';
import { OrganizationLiteFormModule } from '@blockframes/organization/forms/organization-lite-form/organization-lite-form.module';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { StorageFileModule } from '@blockframes/media/pipes/storageFile.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { PasswordConfirmModule } from '@blockframes/ui/form/password-confirm/password-confirm.module';
import { PasswordUpdateModule } from '@blockframes/ui/form/password-update/password-update.module';

@NgModule({
  declarations: [IdentityComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    SigninFormModule,
    TermsConditionsModule,
    AcceptConditionsModule,
    PrivacyPolicyModule,
    AlgoliaAutocompleteModule,
    OrganizationLiteFormModule,
    AppLogoModule,
    StorageFileModule,
    ImageModule,
    PasswordConfirmModule,
    PasswordUpdateModule,

    // Material
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatOptionModule,
    MatFormFieldModule,
    MatTooltipModule,

    RouterModule.forChild([{ path: '', component: IdentityComponent }]),
  ],
})
export class IdentityModule {}
