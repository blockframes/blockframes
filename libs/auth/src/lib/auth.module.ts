import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';

// Angular Fire
import { AngularFireAuthModule } from '@angular/fire/auth';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';

// Component
import { AuthRootComponent } from './root/root.component';
import { UiFormModule } from '@blockframes/ui';
import { SignupFormComponent } from './components/signup-form/signup-form.component';
import { SigninFormComponent } from './components/signin-form/signin-form.component';

export const AuthRoutes: Routes = [
  { path: '', redirectTo: 'connexion', pathMatch: 'full' },
  { path: 'connexion', component: AuthRootComponent }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularFireAuthModule,
    FlexLayoutModule,
    // Material
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSidenavModule,
    RouterModule.forChild(AuthRoutes),
    UiFormModule
  ],
  declarations: [AuthRootComponent, SigninFormComponent, SignupFormComponent],
})
export class AuthModule {}
