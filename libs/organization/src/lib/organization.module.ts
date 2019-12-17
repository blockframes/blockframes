import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Library
import { EditableSidenavModule, AvatarListModule } from '@blockframes/ui';
import { FeedbackMessageModule } from '@blockframes/ui';
import { UploadModule, UiFormModule } from '@blockframes/ui';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { OrganizationFormModule } from './components/organization-form/organization-form.module';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { AssetsThemeModule } from '@blockframes/ui';
import { ReverseModule } from '@blockframes/utils/pipes/reverse.module';

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
import { MatTabsModule } from '@angular/material/tabs';

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
import { ActivateDaoComponent } from './pages/activate-dao/activate-dao.component';
import { ActivityFeedComponent } from './pages/activity-feed/activity-feed.component';

import { MemberGuard } from './member/guard/member.guard';
import { ActiveDaoGuard } from './guard/active-dao.guard';
import { NotificationModule, InvitationModule } from '@blockframes/notification';

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
        path: 'activate',
        canActivate: [MemberGuard],
        canDeactivate: [MemberGuard],
        component: ActivateDaoComponent
      },
      {
        path: 'dao',
        canActivate: [MemberGuard, ActiveDaoGuard],
        canDeactivate: [MemberGuard],
        loadChildren: () => import('@blockframes/ethers').then(m => m.DaoModule)
      },
      { path: 'activity', component: ActivityFeedComponent }
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
    ImageReferenceModule,
    OrganizationFormModule,
    ImgAssetModule,
    AssetsThemeModule,
    NotificationModule,
    InvitationModule,
    ReverseModule,

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
    MatTabsModule,
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
    ActivateDaoComponent,
    ActivityFeedComponent
  ]
})
export class OrganizationModule {}
