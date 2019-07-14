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
import { MatIconModule } from '@angular/material/icon';

// Component
import { LoginViewComponent } from './pages/login-view/login-view.component';
import { UiFormModule } from '@blockframes/ui';
import { SignupFormComponent } from './components/signup-form/signup-form.component';
import { SigninFormComponent } from './components/signin-form/signin-form.component';
import { WelcomeViewComponent } from './pages/welcome-view/welcome-view.component';
import { InvitationComponent } from './pages/invitation/invitation.component';
import { CongratulationComponent } from './pages/congratulation/congratulation.component';

export const AuthRoutes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeViewComponent },
  { path: 'connexion', component: LoginViewComponent },
  { path: 'invitation', component: InvitationComponent },
  { path: 'congratulation', component: CongratulationComponent }
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
    MatIconModule,
    RouterModule.forChild(AuthRoutes),
    UiFormModule
  ],
  declarations: [
    LoginViewComponent,
    SigninFormComponent,
    SignupFormComponent,
    WelcomeViewComponent,
    InvitationComponent,
    CongratulationComponent
  ]
})
export class AuthModule {}
