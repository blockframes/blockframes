import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventLoginComponent } from './login.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SnackbarLinkModule } from '@blockframes/ui/snackbar/link/snackbar-link.module';
import { SnackbarErrorModule } from '@blockframes/ui/snackbar/error/snackbar-error.module';
import { PasswordInputModule } from '@blockframes/ui/form/password-input/password-input.module';

@NgModule({
  declarations: [EventLoginComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    SnackbarLinkModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ImageModule,
    AppLogoModule,
    MatIconModule,
    SnackbarErrorModule,
    PasswordInputModule,
    RouterModule.forChild([{ path: '', component: EventLoginComponent }]),
  ]
})
export class LoginModule { }
