import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

import { SigninFormModule } from '../../components/signin-form/signin-form.module';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Component
import { LoginComponent } from './login.component';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    SigninFormModule,
    AppLogoModule,

    // Material
    MatSnackBarModule,

    RouterModule.forChild([{ path: '', component: LoginComponent }]),
  ],
})
export class LoginModule {}
