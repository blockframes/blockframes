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
import { OrganizationMemberAddComponent } from './components/organization-member-add/organization-member-addcomponent';
import { OrganizationActionRepertoryComponent } from './components/organization-action-repertory/organization-action-repertory.component';
import { OrganizationSignerRepertoryComponent } from './components/organization-signer-repertory/organization-signer-repertory.component';
import { OrganizationSignerFormComponent } from './components/organization-signer-form/organization-signer-form.component';
import { OrganizationWidgetComponent } from './components/organization-widget/organization-widget.component';
import { OrganizationFormComponent } from './components/organization-form/organization-form.component';
import { OrganizationQuorumFormComponent } from './components/organization-quorum-form/organization-quorum-form.component';
import { OrganizationActivityRepertoryComponent } from './components/organization-activity-repertory/organization-activity-repertory.component';
import { OrganizationMemberPendingComponent } from './components/organization-member-pending/organization-member-pending.component';
import { OrganizationMemberInvitationComponent } from './components/organization-member-invitation/organization-member-invitation.component';


// Pages
import { OrganizationMemberRepertoryComponent } from './components/organization-member-repertory/organization-member-repertory.component';
import { MemberViewComponent } from './pages/member-view/member-view.component';
import { OrganizationActivityViewComponent } from './pages/organization-activity-view/organization-activity-view.component';
import { OrganizationAdminViewComponent } from './pages/organization-admin-view/organization-admin-view.component';
import { OrganizationEditableComponent } from './pages/organization-editable/organization-editable.component';
import { OrganizationMemberEditableComponent } from './pages/organization-member-editable/organization-member-editable.component';

export const organizationRoutes: Routes = [
  {
    path: ':orgId',
    children: [
      { path: '', redirectTo: 'edit', pathMatch: 'full' },
      { path: 'edit', component: OrganizationEditableComponent },
      {
        path: 'members',
        component: OrganizationMemberEditableComponent
      },
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
    OrganizationMemberPendingComponent,
    OrganizationMemberInvitationComponent,
    OrganizationDisplayComponent,
    OrganizationMemberEditableComponent,
    OrganizationWidgetComponent,
    OrganizationMemberRepertoryComponent,
    MemberViewComponent,
    OrganizationMemberAddComponent,
    OrganizationActivityViewComponent,
    OrganizationActivityRepertoryComponent,
    OrganizationAdminViewComponent,
    OrganizationActionRepertoryComponent,
    OrganizationSignerRepertoryComponent,
    OrganizationSignerFormComponent,
    OrganizationEditableComponent,
    OrganizationFormComponent,
    OrganizationActivityViewComponent,
    OrganizationQuorumFormComponent
  ],
  exports: [OrganizationWidgetComponent]
})
export class OrganizationModule {}
