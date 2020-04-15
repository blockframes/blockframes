import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Library
import { FeedbackMessageModule } from '@blockframes/ui/feedback/feedback-message.module';
import { UploadModule } from '@blockframes/ui/upload/upload.module';
import { PasswordConfirmModule } from '@blockframes/ui/form/password-confirm/password-confirm.module';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { OrganizationFormModule } from './forms/organization-form/organization-form.module';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { EditableSidenavModule } from '@blockframes/ui/editable-sidenav/editable-sidenav.module';
import { AvatarListModule } from '@blockframes/ui/avatar-list/avatar-list.module';

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
import { OrganizationDisplayModule } from './components/organization-display/organization-display.module';
import { MatTooltipModule } from '@angular/material/tooltip';

// Components
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';

// Pages
import { ActivateDaoComponent } from './pages/activate-dao/activate-dao.component';
import { UserGuard } from '@blockframes/user/guard/user.guard';
import { ActiveDaoGuard } from './guard/active-dao.guard';

export const organizationRoutes: Routes = [
  {
    path: ':orgId',
    children: [
      { path: '', redirectTo: 'view', pathMatch: 'full' },
      { path: 'view', loadChildren: () => import('./pages/view/view.module').then(m => m.OrganizationViewModule)},
      {
        path: 'activate',
        canActivate: [UserGuard],
        canDeactivate: [UserGuard],
        component: ActivateDaoComponent
      },
      {
        path: 'dao',
        canActivate: [UserGuard, ActiveDaoGuard],
        canDeactivate: [UserGuard],
        loadChildren: () => import('@blockframes/ethers/dao/dao.module').then(m => m.DaoModule)
      }
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
    PasswordConfirmModule,
    CropperModule,
    ImageReferenceModule,
    OrganizationFormModule,
    ImgAssetModule,

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
    MatTooltipModule,
    TableFilterModule,
    OrganizationDisplayModule,
    RouterModule.forChild(organizationRoutes)
  ],
  declarations: [
    ActivateDaoComponent
  ]
})
export class OrganizationModule {}
