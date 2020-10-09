import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { ProfileFormModule } from '@blockframes/auth/forms/profile/profile.module';
import { PasswordFormModule } from '@blockframes/auth/forms/password/password.module';

// Components
import { ProfileComponent } from './profile.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    ProfileFormModule,
    PasswordFormModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: ProfileComponent }])
  ],
  declarations: [ProfileComponent],
})
export class ProfileModule { }
