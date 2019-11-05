import { AuthGuard } from './guard/auth.guard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { CropperModule } from '@blockframes/ui/cropper/cropper.module';

// Angular Fire
import { AngularFireAuthModule } from '@angular/fire/auth';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Component
import { LoginViewComponent } from './pages/login-view/login-view.component';
import { UiFormModule, FeedbackMessageModule } from '@blockframes/ui';
import { SignupFormComponent } from './components/signup-form/signup-form.component';
import { SigninFormComponent } from './components/signin-form/signin-form.component';
import { EmailVerifyComponent } from './components/email-verify/email-verify.component';
import { WelcomeViewComponent } from './pages/welcome-view/welcome-view.component';
import { IdentityComponent } from './pages/identity/identity.component';
import { IdentityFeedbackComponent } from './pages/identity-feedback/identity-feedback.component';
import { EmailVerificationComponent } from './pages/email-verification/email-verification.component';
import { PasswordResetComponent } from './pages/password-reset/password-reset.component';

export const AuthRoutes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeViewComponent },
  { path: 'connexion', component: LoginViewComponent },
  { path: 'identity', component: IdentityComponent, canActivate: [AuthGuard], canDeactivate: [AuthGuard] },
  { path: 'congratulation', component: IdentityFeedbackComponent },
  { path: 'email-verification', component: EmailVerificationComponent},
  { path: 'password-reset', component: PasswordResetComponent}
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularFireAuthModule,
    FlexLayoutModule,
    CropperModule,
    // Material
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    MatCheckboxModule,
    FeedbackMessageModule,

    RouterModule.forChild(AuthRoutes),
    UiFormModule
  ],
  declarations: [
    LoginViewComponent,
    SigninFormComponent,
    SignupFormComponent,
    WelcomeViewComponent,
    IdentityComponent,
    EmailVerifyComponent,
    IdentityFeedbackComponent,
    EmailVerificationComponent,
    PasswordResetComponent
  ],
  exports: [EmailVerifyComponent]
})
export class AuthModule {}
