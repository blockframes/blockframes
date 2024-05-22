import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';

import { PasswordConfirmModule } from '@blockframes/ui/form/password-confirm/password-confirm.module';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';
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
    ImageModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatMenuModule,
    EditableSidenavModule,
    PasswordConfirmModule,
    FileUploaderModule,
    RouterModule.forChild(profileRoutes),
  ],
  declarations: [],
})
export class UserDisplayModule { }
