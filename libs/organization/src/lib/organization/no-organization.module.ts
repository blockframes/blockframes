import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { OrganizationFormModule } from './forms/organization-form/organization-form.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module';
import { AppPipeModule, WorkspacePipeModule } from '@blockframes/utils/pipes';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { AuthDataValidationModule } from '@blockframes/auth/components/data-validation/data-validation.module';

// Material
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

// Components
import { OrganizationPendingComponent } from './pages/organization-pending/organization-pending.component';

// Guards
import { NotFullyVerifiedGuard } from '@blockframes/auth/guard/not-fully-verified.guard';
import { PendingOrganizationGuard } from './guard/pending-organization.guard';

export const noOrganizationRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('@blockframes/ui/error/error-not-found.module').then(m => m.ErrorNotFoundModule)
  },
  {
    path: 'join-congratulations',
    canActivate: [NotFullyVerifiedGuard],
    component: OrganizationPendingComponent
  },
  {
    path: 'create-congratulations',
    canActivate: [PendingOrganizationGuard],
    component: OrganizationPendingComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    OrganizationFormModule,
    ImageModule,
    AlgoliaAutocompleteModule,
    WorkspacePipeModule,
    AppLogoModule,
    AuthDataValidationModule,
    AppPipeModule,

    // Material
    MatFormFieldModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatRadioModule,
    MatRippleModule,
    MatTooltipModule,

    RouterModule.forChild(noOrganizationRoutes),
  ],
  declarations: [
    OrganizationPendingComponent,
  ]
})
export class NoOrganizationModule { }
