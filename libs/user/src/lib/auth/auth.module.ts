import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Angular Fire
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirePerformanceModule } from '@angular/fire/performance';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';

// Component
import { PasswordConfirmModule } from '@blockframes/ui/form/password-confirm/password-confirm.module';
import { IdentityComponent } from './pages/identity/identity.component';
import { EmailVerificationComponent } from './pages/email-verification/email-verification.component';
import { PasswordResetComponent } from './pages/password-reset/password-reset.component';
import { TermsConditionsModule } from './components/terms-conditions/terms-conditions.module';
import { AcceptConditionsModule } from './components/accept-conditions/accept-conditions.module';
import { PrivacyPolicyModule } from './components/privacy-policy/privacy-policy.module';

// Guards
import { IdentityGuard } from './guard/identity.guard';
import { NoAuthGuard } from './guard/no-auth.guard';

export const AuthRoutes: Routes = [
  { path: '', redirectTo: 'connexion', pathMatch: 'full' }, // @TODO (#2825) remove if not used
  {
    path: 'connexion',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'identity',
    canActivate: [IdentityGuard],
    canDeactivate: [IdentityGuard],
    component: IdentityComponent
  },
  // @TODO (#2875) rename to password-reset
  { path: 'email-verification', component: EmailVerificationComponent },
  // @TODO (#2875) should be removed, google is doing this for us
  { path: 'password-reset', component: PasswordResetComponent }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    ImageUploaderModule,
    TermsConditionsModule,
    PrivacyPolicyModule,
    AcceptConditionsModule,
    PasswordConfirmModule,
    ImageModule,

    // Material
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    MatCheckboxModule,
    MatCardModule,

    // Fire
    AngularFireAuthModule,
    AngularFirePerformanceModule,
    RouterModule.forChild(AuthRoutes),
  ],
  declarations: [
    IdentityComponent,
    EmailVerificationComponent,
    PasswordResetComponent
  ],
})
export class AuthModule { }
