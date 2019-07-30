import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';
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
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { ProfileDeleteComponent } from './profile-delete/profile-delete.component';
import { ProfileWidgetComponent } from './profile-widget/profile-widget.component';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { ProfileEditableComponent } from './pages/profile-editable/profile-editable.component';
import { EditableSidenavModule, UiFormModule } from '@blockframes/ui';
import { PasswordFormComponent } from './components/password-form/password-form.component';

export const profileRoutes: Routes = [
  { path: '', redirectTo: 'edit', pathMatch: 'full' },
  { path: 'edit', component: ProfileEditableComponent },
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
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
    UiFormModule,
    RouterModule.forChild(profileRoutes),
  ],
  declarations: [
    ProfileDisplayComponent,
    ProfileFormComponent,
    ProfileDeleteComponent,
    ProfileWidgetComponent,
    ProfileMenuComponent,
    ProfileEditableComponent,
    PasswordFormComponent
  ],
  exports: [
    ProfileDeleteComponent,
    ProfileWidgetComponent,
    ProfileMenuComponent,
  ],
})
export class ProfileModule {}
