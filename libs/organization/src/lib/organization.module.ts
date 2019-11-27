import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Library
import { EditableSidenavModule, AvatarListModule } from '@blockframes/ui';
import { FeedbackMessageModule } from '@blockframes/ui';
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
import { MemberPendingComponent } from './components/member-pending/member-pending.component';
import { MemberInvitationComponent } from './components/member-invitation/member-invitation.component';
import { MemberFormRoleComponent } from './components/member-form-role/member-form-role.component';

// Pages
import { MemberRepertoryComponent } from './components/member-repertory/member-repertory.component';
import { OrganizationEditableComponent } from './pages/organization-editable/organization-editable.component';
import { MemberEditableComponent } from './pages/member-editable/member-editable.component';

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
      {
        path: 'dao',
        canActivate: [MemberGuard],
        canDeactivate: [MemberGuard],
        loadChildren: () => import('../../../ethers/src').then(m => m.DaoModule) },
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,

    // Library
    EditableSidenavModule,
    FeedbackMessageModule,
    AvatarListModule,
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
    MemberRepertoryComponent,
    MemberAddComponent,
    OrganizationEditableComponent,
  ]
})
export class OrganizationModule {}
