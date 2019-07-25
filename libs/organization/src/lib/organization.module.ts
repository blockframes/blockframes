import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { AuthModule } from '@blockframes/auth';
import { EditableSidenavModule } from '@blockframes/ui';
import { FeedbackMessageModule } from '@blockframes/ui';

// Material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Components
import { OrganizationDisplayComponent } from './components/organization-display/organization-display.component';
import { MemberFormComponent } from './components/member-form/member-form.component';
import { OrganizationActionItemComponent } from './components/organization-action-item/organization-action-item.component';
import { OrganizationActionRepertoryComponent } from './components/organization-action-repertory/organization-action-repertory.component';
import { OrganizationSignerRepertoryComponent } from './components/organization-signer-repertory/organization-signer-repertory.component';
import { OrganizationSignerFormComponent } from './components/organization-signer-form/organization-signer-form.component';
import { OrganizationQuorumRepertoryComponent } from './components/organization-quorum-repertory/organization-quorum-repertory.component';
import { OrganizationWidgetComponent } from './components/organization-widget/organization-widget.component';
import { OrganizationFormComponent } from './components/organization-form/organization-form.component';

// Pages
import { MemberListComponent } from './pages/member-list/member-list.component';
import { MemberViewComponent } from './pages/member-view/member-view.component';
import { OrganizationActivityViewComponent } from './pages/organization-activity-view/organization-activity-view.component';
import { OrganizationAdminViewComponent } from './pages/organization-admin-view/organization-admin-view.component';
import { OrganizationEditableComponent } from './pages/organization-editable/organization-editable.component';

export const organizationRoutes: Routes = [
  {
    path: ':orgId',
    children: [
      { path: '', redirectTo: 'edit', pathMatch: 'full' },
      { path: 'edit', component: OrganizationEditableComponent },
      {
        path: 'activityreports',
        component: OrganizationActivityViewComponent
      },
      {
        path: 'administration',
        component: OrganizationAdminViewComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AuthModule,
    FlexLayoutModule,
    EditableSidenavModule,
    FeedbackMessageModule,

    // Material
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    MatRippleModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    RouterModule.forChild(organizationRoutes)
  ],
  declarations: [
    OrganizationFormComponent,
    OrganizationDisplayComponent,
    OrganizationWidgetComponent,
    MemberListComponent,
    MemberViewComponent,
    MemberFormComponent,
    OrganizationActivityViewComponent,
    OrganizationActionItemComponent,
    OrganizationAdminViewComponent,
    // TODO(PL): maybe you have to change the suffix because now they take in a form,
    // so it is not a repertory anymore. But it depens on how you handle it.
    OrganizationActionRepertoryComponent,
    OrganizationSignerRepertoryComponent,
    OrganizationSignerFormComponent,
    OrganizationQuorumRepertoryComponent,
    OrganizationEditableComponent,
    OrganizationActionItemComponent,
    OrganizationActivityViewComponent
  ],
  exports: [OrganizationWidgetComponent]
})
export class OrganizationModule {}
