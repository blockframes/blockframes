import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';

// Material
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

// Blockframes
import { PasswordConfirmModule } from '@blockframes/ui/form/password-confirm/password-confirm.module';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { TermsConditionsModule } from './components/terms-conditions/terms-conditions.module';
import { PrivacyPolicyModule } from './components/privacy-policy/privacy-policy.module';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module';
import { OrganizationLiteFormModule } from '@blockframes/organization/forms/organization-lite-form/organization-lite-form.module';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { SnackbarLinkModule } from '@blockframes/ui/snackbar/link/snackbar-link.module';
import { SnackbarErrorModule } from '@blockframes/ui/snackbar/error/snackbar-error.module';

// Guards
import { IdentityGuard } from './guard/identity.guard';
import { NoAuthGuard } from './guard/no-auth.guard';
import { NoLegalTermsGuard } from './guard/no-legal-terms.guard';
import { AnonymousAuthGuard } from './guard/anonymous-auth-guard';

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
    path: 'checkPrivacyAndTerms',
    canActivate: [NoLegalTermsGuard],
    loadChildren: () => import('./pages/checkPolicyAndTerms/checkPolicyAndTerms.module').then(m => m.CheckPolicyAndTermsModule)
  },
  {
    path: 'identity',
    canActivate: [AnonymousAuthGuard, IdentityGuard],
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
    SnackbarLinkModule,
    SnackbarErrorModule,

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
    RouterModule.forChild(AuthRoutes),
  ],
  declarations: [
    ResetPasswordComponent,
    ChangePasswordComponent
  ],
})
export class AuthModule { }
