import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProfileDisplayComponent } from './components/profile-display/profile-display.component';
import { ProfileFormComponent } from './forms/profile/profile.component';
import { ProfileEditableComponent } from './pages/profile-editable/profile-editable.component';
import { EditableSidenavModule, UploadModule } from '@blockframes/ui';
import { PasswordConfirmModule } from '@blockframes/ui/form';
import { PasswordFormComponent } from './forms/password/password.component';

export const profileRoutes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  { path: 'view', loadChildren: () => import('./pages/view/view.module').then(m => m.ProfileViewModule)},
  { path: 'edit', component: ProfileEditableComponent },
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
  declarations: [
    ProfileDisplayComponent,
    ProfileFormComponent,
    ProfileEditableComponent,
    PasswordFormComponent
  ],
})
export class ProfileModule {}
