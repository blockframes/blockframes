import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';

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
import { MatCardModule } from '@angular/material';

// Component
import { FeedbackMessageModule } from '@blockframes/ui';
import { PasswordConfirmModule } from '@blockframes/ui/form';
import { WelcomeViewComponent } from './pages/welcome-view/welcome-view.component';
import { IdentityComponent } from './pages/identity/identity.component';
import { IdentityFeedbackComponent } from './pages/identity-feedback/identity-feedback.component';
import { EmailVerificationComponent } from './pages/email-verification/email-verification.component';
import { PasswordResetComponent } from './pages/password-reset/password-reset.component';
import { TermsConditionsModule } from './components/terms-conditions/terms-conditions.module';
import { AcceptConditionsModule } from './components/accept-conditions/accept-conditions.module';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { IdentityGuard } from './guard/identity.guard';

export const AuthRoutes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeViewComponent },
  {
    path: 'connexion',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'identity',
    canActivate: [IdentityGuard],
    canDeactivate: [IdentityGuard],
    component: IdentityComponent
  },
  { path: 'congratulation', component: IdentityFeedbackComponent },
  { path: 'email-verification', component: EmailVerificationComponent},
  { path: 'password-reset', component: PasswordResetComponent}
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CropperModule,
    TermsConditionsModule,
    AcceptConditionsModule,
    PasswordConfirmModule,
    ImgAssetModule,

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
    FeedbackMessageModule,
    MatCardModule,

    // Fire
    AngularFireAuthModule,
    AngularFirePerformanceModule,
    RouterModule.forChild(AuthRoutes),
  ],
  declarations: [
    WelcomeViewComponent,
    IdentityComponent,
    IdentityFeedbackComponent,
    EmailVerificationComponent,
    PasswordResetComponent
  ],
})
export class AuthModule {}
