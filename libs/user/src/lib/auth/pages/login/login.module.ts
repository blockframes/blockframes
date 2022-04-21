import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

import { SigninFormModule } from '../../components/signin-form/signin-form.module';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { SnackbarLinkModule } from '@blockframes/ui/snackbar/link/snackbar-link.module';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Component
import { LoginComponent } from './login.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    SigninFormModule,
    AppLogoModule,
    SnackbarLinkModule,

    // Material
    MatSnackBarModule,
    ImageModule,

    RouterModule.forChild([{ path: '', component: LoginComponent }]),
  ],
})
export class LoginModule { }
