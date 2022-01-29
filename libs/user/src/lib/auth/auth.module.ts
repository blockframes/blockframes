import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
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
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { TermsConditionsModule } from './components/terms-conditions/terms-conditions.module';
import { PrivacyPolicyModule } from './components/privacy-policy/privacy-policy.module';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module';
import { OrganizationLiteFormModule } from '@blockframes/organization/forms/organization-lite-form/organization-lite-form.module';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';

// Guards
import { IdentityGuard } from './guard/identity.guard';
import { NoAuthGuard } from './guard/no-auth.guard';

export const AuthRoutes: Routes = [
  { path: '', redirectTo: 'connexion', pathMatch: 'full' },
  {
    path: 'connexion',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'terms',
    loadChildren: () => import('@blockframes/ui/static-informations/terms/terms.module').then(m => m.TermsModule)
  },
  {
    path: 'privacy',
    loadChildren: () => import('@blockframes/ui/static-informations/privacy/privacy.module').then(m => m.PrivacyModule)
  },
  {
    path: 'identity',
    canActivate: [IdentityGuard],
    loadChildren: () => import('./pages/identity/identity.module').then(m => m.IdentityModule)
  },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'change-password', component: ChangePasswordComponent }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TermsConditionsModule,
    PrivacyPolicyModule,
    PasswordConfirmModule,
    ImageModule,
    AlgoliaAutocompleteModule,
    OrganizationLiteFormModule,
    AppLogoModule,

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
    ResetPasswordComponent,
    ChangePasswordComponent
  ],
})
export class AuthModule { }
