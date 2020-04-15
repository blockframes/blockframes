import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';
import { OrganizationFormModule } from './forms/organization-form/organization-form.module';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module';
import { ActionsListModule } from '@blockframes/ui/actions-list/actions-list.module';
import { FeedbackMessageModule } from '@blockframes/ui/feedback/feedback-message.module';

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

// Components
import { OrganizationHomeComponent } from './pages/organization-home/organization-home.component';
import { OrganizationFindComponent } from './pages/organization-find/organization-find.component';
import { OrganizationFeedbackComponent } from './pages/organization-feedback/organization-feedback.component';
import { OrganizationCreateFeedbackComponent } from './pages/organization-create-feedback/organization-create-feedback.component';
import { OrganizationCreateComponent } from './pages/organization-create/organization-create.component';
import { OrganizationAppAccessComponent } from './pages/organization-app-access/organization-app-access.component';

// Guards
import { NoOrganizationInvitationGuard } from '@blockframes/invitation/guard/no-organization-invitation.guard';
import { NoOrganizationGuard } from './guard/no-organization.guard';
import { PendingOrganizationGuard } from './guard/pending-organization.guard';

export const noOrganizationRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    canActivate: [NoOrganizationGuard, NoOrganizationInvitationGuard],
    component: OrganizationHomeComponent,
  },
  {
    path: 'find',
    canActivate: [NoOrganizationGuard, NoOrganizationInvitationGuard],
    component: OrganizationFindComponent,
  },
  {
    path: 'join-congratulations',
    component: OrganizationFeedbackComponent
  },
  {
    path: 'create-congratulations',
    canActivate: [PendingOrganizationGuard],
    component: OrganizationCreateFeedbackComponent
  },
  {
    path: 'create',
    canActivate: [NoOrganizationGuard, NoOrganizationInvitationGuard],
    component: OrganizationCreateComponent,
  },
  {
    path: 'app-access',
    component: OrganizationAppAccessComponent,
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    CropperModule,
    OrganizationFormModule,
    ImgAssetModule,
    ImageReferenceModule,
    AlgoliaAutocompleteModule,

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

    // UI
    ActionsListModule,
    FeedbackMessageModule,

    RouterModule.forChild(noOrganizationRoutes),
  ],
  declarations: [
    OrganizationHomeComponent,
    OrganizationFindComponent,
    OrganizationFeedbackComponent,
    OrganizationCreateComponent,
    OrganizationAppAccessComponent,
    OrganizationCreateFeedbackComponent
  ]
})
export class NoOrganizationModule { }
