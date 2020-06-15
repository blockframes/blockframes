import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

import { SigninFormModule } from '../../components/signin-form/signin-form.module';
import { SignupFormModule } from '../../components/signup-form/signup-form.module';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';

// Component
import { LoginComponent } from './login.component';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';


@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    SigninFormModule,
    SignupFormModule,
    ImageReferenceModule,

    // Material
    MatSnackBarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,

    RouterModule.forChild([{ path: '', component: LoginComponent }]),
  ],
})
export class LoginModule {}
