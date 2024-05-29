import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationLoginComponent } from './login.component';
import { RouterModule } from '@angular/router';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatIconModule } from '@angular/material/icon';

// Blockframes
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SnackbarLinkModule } from '@blockframes/ui/snackbar/link/snackbar-link.module';
import { SnackbarErrorModule } from '@blockframes/ui/snackbar/error/snackbar-error.module';
import { PasswordInputModule } from '@blockframes/ui/form/password-input/password-input.module';

@NgModule({
  declarations: [OrganizationLoginComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SnackbarLinkModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    AppLogoModule,
    SnackbarErrorModule,
    PasswordInputModule,
    RouterModule.forChild([{ path: '', component: OrganizationLoginComponent }]),
  ]
})
export class LoginModule { }
