import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Library
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';
import { PasswordConfirmModule } from '@blockframes/ui/form/password-confirm/password-confirm.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { OrganizationFormModule } from './forms/organization-form/organization-form.module';
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

// Pages
import { ActivateDaoComponent } from './pages/activate-dao/activate-dao.component';

// Guards
import { UserGuard } from '@blockframes/user/guard/user.guard';

export const organizationRoutes: Routes = [
  {
    path: ':orgId',
    children: [
      { path: '', redirectTo: 'view', pathMatch: 'full' },
      { path: 'view', loadChildren: () => import('./pages/view/view.module').then(m => m.OrganizationViewModule) },
      {
        path: 'activate',
        canActivate: [UserGuard],
        canDeactivate: [UserGuard],
        component: ActivateDaoComponent
      },
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
    AvatarListModule,
    FileUploaderModule,
    PasswordConfirmModule,
    ImageModule,
    OrganizationFormModule,
    OrganizationDisplayModule,

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
    RouterModule.forChild(organizationRoutes)
  ],
  declarations: [
    ActivateDaoComponent
  ]
})
export class OrganizationModule { }
