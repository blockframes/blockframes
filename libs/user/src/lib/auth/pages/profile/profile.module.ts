import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { ProfileFormModule } from '@blockframes/auth/forms/profile/profile.module';
import { ChangePasswordModule } from '@blockframes/auth/forms/password/change-password.module';

// Components
import { ProfileComponent } from './profile.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Modules
    ProfileFormModule,
    ChangePasswordModule,

    // Material
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: ProfileComponent }])
  ],
  declarations: [ProfileComponent],
})
export class ProfileModule { }
