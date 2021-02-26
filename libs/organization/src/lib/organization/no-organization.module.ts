import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';
import { OrganizationFormModule } from './forms/organization-form/organization-form.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module';
import { WorkspacePipeModule } from '@blockframes/utils/pipes';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { AuthDataValidationModule } from '@blockframes/auth/components/data-validation/data-validation.module';

// Material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

// Components
import { OrganizationJoinPendingComponent } from './pages/organization-join-pending/organization-join-pending.component';
import { OrganizationCreatePendingComponent } from './pages/organization-create-pending/organization-create-pending.component';

// Guards
import { NoOrganizationInvitationGuard } from '@blockframes/invitation/guard/no-organization-invitation.guard';
import { NoOrganizationGuard } from './guard/no-organization.guard';
import { PendingOrganizationGuard } from './guard/pending-organization.guard';

export const noOrganizationRoutes: Routes = [
  {
    path: '',
    canActivate: [NoOrganizationGuard, NoOrganizationInvitationGuard],
    pathMatch: 'full'
  },
  {
    path: 'join-congratulations',
    canActivate: [NoOrganizationGuard, NoOrganizationInvitationGuard],
    component: OrganizationJoinPendingComponent
  },
  {
    path: 'create-congratulations',
    canActivate: [PendingOrganizationGuard],
    component: OrganizationCreatePendingComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    ImageUploaderModule,
    OrganizationFormModule,
    ImageModule,
    AlgoliaAutocompleteModule,
    WorkspacePipeModule,
    AppLogoModule,
    AuthDataValidationModule,

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
    OrganizationJoinPendingComponent,
    OrganizationCreatePendingComponent
  ]
})
export class NoOrganizationModule { }
