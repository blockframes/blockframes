import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

// Component
import { IdentityComponent } from './identity.component';

// Modules
import { SigninFormModule } from '../../components/signin-form/signin-form.module';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module';
import { OrganizationLiteFormModule } from '@blockframes/organization/forms/organization-lite-form/organization-lite-form.module';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { StorageFileModule } from '@blockframes/media/pipes/storageFile.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { PasswordConfirmModule } from '@blockframes/ui/form/password-confirm/password-confirm.module';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { AppPipeModule } from '@blockframes/utils/pipes';
import { SnackbarLinkModule } from '@blockframes/ui/snackbar/link/snackbar-link.module';
import { SnackbarErrorModule } from '@blockframes/ui/snackbar/error/snackbar-error.module';
import { HideEmailModule } from '@blockframes/auth/components/hide-email/hide-email.module';
import { PasswordInputModule } from '@blockframes/ui/form/password-input/password-input.module';

@NgModule({
  declarations: [IdentityComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    SigninFormModule,
    AlgoliaAutocompleteModule,
    OrganizationLiteFormModule,
    AppLogoModule,
    StorageFileModule,
    ImageModule,
    PasswordConfirmModule,
    AppPipeModule,
    SnackbarLinkModule,
    SnackbarErrorModule,
    HideEmailModule,
    PasswordInputModule,

    // Material
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatOptionModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatCheckboxModule,

    RouterModule.forChild([{ path: '', component: IdentityComponent }]),
  ],
})
export class IdentityModule { }
