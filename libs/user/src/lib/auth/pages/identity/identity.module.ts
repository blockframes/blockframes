import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

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
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AppPipeModule } from '@blockframes/utils/pipes';

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
export class IdentityModule {}
