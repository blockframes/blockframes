import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { AuthModule } from '@blockframes/auth';
import { EditableSidenavModule, AvatarListModule } from '@blockframes/ui';
import { FeedbackMessageModule } from '@blockframes/ui';
import { WalletModule } from '@blockframes/ethers';
import { UploadModule, UiFormModule } from '@blockframes/ui';
import { CropperModule } from '@blockframes/ui/cropper/cropper.module'
import { OrganizationFormModule } from './components/organization-form/organization-form.module';

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
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Components
import { OrganizationDisplayComponent } from './components/organization-display/organization-display.component';
import { MemberAddComponent } from './components/member-add/member-add.component';
import { OrganizationSignerRepertoryComponent } from './components/organization-signer-repertory/organization-signer-repertory.component';
import { OrganizationSignerFormComponent } from './components/organization-signer-form/organization-signer-form.component';
import { OrganizationWidgetComponent } from './components/organization-widget/organization-widget.component';
import { MemberPendingComponent } from './components/member-pending/member-pending.component';
import { MemberInvitationComponent } from './components/member-invitation/member-invitation.component';
import { MemberFormRoleComponent } from './components/member-form-role/member-form-role.component';
import { OrganizationSearchComponent } from './components/organization-search/organization-search.component';
import { OrganizationFormOperationComponent } from './components/organization-form-operation/organization-form-operation.component';
import { OrganizationDisplayActionsComponent } from './components/organization-display-actions/organization-display-actions.component';
import { OrganizationDisplayOperationsComponent } from './components/organization-display-operations/organization-display-operations.component';

// Pages
import { MemberRepertoryComponent } from './components/member-repertory/member-repertory.component';
import { OrganizationActivityViewComponent } from './pages/organization-activity-view/organization-activity-view.component';
import { OrganizationAdminViewComponent } from './pages/organization-admin-view/organization-admin-view.component';
import { OrganizationEditableComponent } from './pages/organization-editable/organization-editable.component';
import { MemberEditableComponent } from './pages/member-editable/member-editable.component';

// TODO issue#1146
import { AFM_DISABLE } from '@env';
import { MemberGuard } from './member/guard/member.guard';

export const organizationRoutes: Routes = [
  {
    path: ':orgId',
    children: [
      { path: '', redirectTo: 'edit', pathMatch: 'full' },
      { path: 'edit', component: OrganizationEditableComponent },
      {
        path: 'members',
        canActivate: [MemberGuard],
        canDeactivate: [MemberGuard],
        component: MemberEditableComponent
      },
    ]
  }
];

// TODO issue#1146
if (AFM_DISABLE) {
  organizationRoutes[0].children.push(
    {
      path: 'activityreports',
      component: OrganizationActivityViewComponent
    }
  );
  organizationRoutes[0].children.push(
    {
      path: 'administration',
      canActivate: [MemberGuard],
      canDeactivate: [MemberGuard],
      component: OrganizationAdminViewComponent
    }
  );
}

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AuthModule,
    FlexLayoutModule,
    EditableSidenavModule,
    FeedbackMessageModule,
    AvatarListModule,
    WalletModule,
    UploadModule,
    UiFormModule,
    CropperModule,
    OrganizationFormModule,

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
    MatProgressBarModule,
    RouterModule.forChild(organizationRoutes)
  ],
  declarations: [
    MemberPendingComponent,
    MemberFormRoleComponent,
    MemberInvitationComponent,
    OrganizationDisplayComponent,
    MemberEditableComponent,
    OrganizationWidgetComponent,
    MemberRepertoryComponent,
    MemberAddComponent,
    OrganizationActivityViewComponent,
    OrganizationFormOperationComponent,
    OrganizationDisplayActionsComponent,
    OrganizationAdminViewComponent,
    OrganizationDisplayOperationsComponent,
    OrganizationSignerRepertoryComponent,
    OrganizationSignerFormComponent,
    OrganizationEditableComponent,
    OrganizationActivityViewComponent,
    OrganizationSearchComponent
  ],
  exports: [OrganizationWidgetComponent, OrganizationSearchComponent]
})
export class OrganizationModule {}
