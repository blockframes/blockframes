import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';
import { CropperModule } from '@blockframes/media/components/cropper/cropper.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PasswordConfirmModule } from '@blockframes/ui/form/password-confirm/password-confirm.module';
import { UploadModule } from '@blockframes/media/components/upload/upload.module';
import { EditableSidenavModule } from '@blockframes/ui/editable-sidenav/editable-sidenav.module';

export const profileRoutes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  { path: 'view', loadChildren: () => import('@blockframes/auth/pages/profile-view/profile-view.module').then(m => m.ProfileViewModule) },
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CropperModule,
    ImageReferenceModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatMenuModule,
    EditableSidenavModule,
    PasswordConfirmModule,
    UploadModule,
    RouterModule.forChild(profileRoutes),
  ],
  declarations: [],
})
export class UserDisplayModule { }
