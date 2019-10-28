import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { FeedbackMessageModule, ActionsListModule } from '@blockframes/ui';
import { CropperModule } from '@blockframes/ui/cropper/cropper.module'

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
import { MatProgressBarModule } from '@angular/material';

// Components
import { OrganizationHomeComponent } from './pages/organization-home/organization-home.component';
import { OrganizationFindComponent } from './pages/organization-find/organization-find.component';
import { OrganizationFeedbackComponent } from './pages/organization-feedback/organization-feedback.component';
import { OrganizationCreateComponent } from './components/organization-create/organization-create.component';
import { OrganizationLoadingComponent } from './pages/organization-loading/organization-loading.component';


export const noOrganizationRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: OrganizationHomeComponent
  },
  {
    path: 'find',
    component: OrganizationFindComponent
  },
  {
    path: 'congratulation',
    component: OrganizationFeedbackComponent
  },
  {
    path: 'create',
    component: OrganizationCreateComponent
  },
  {
    path: 'loading',
    component: OrganizationLoadingComponent
  },
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    CropperModule,

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
    OrganizationLoadingComponent,
  ]
})
export class NoOrganizationModule {}
