import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

import { BackgroundAssetModule } from '@blockframes/ui/theme/background-asset.module';
import { SigninFormModule } from '../../components/signin-form/signin-form.module';
import { SignupFormModule } from '../../components/signup-form/signup-form.module';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';

// Component
import { LoginComponent } from './login.component';


@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    SigninFormModule,
    SignupFormModule,
    BackgroundAssetModule,

    // Material
    MatSnackBarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,

    RouterModule.forChild([{ path: '', component: LoginComponent }]),
  ],
})
export class LoginModule {}
