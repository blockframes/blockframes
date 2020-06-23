import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { ProfileFormModule } from '@blockframes/auth/forms/profile/profile.module';
import { PasswordFormModule } from '@blockframes/auth/forms/password/password.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';

// Components
import { ProfileViewComponent } from './profile-view.component';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [ProfileViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,
    ProfileFormModule,
    PasswordFormModule,
    // Material
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    OrgNameModule,
    RouterModule.forChild([{ path: '', component: ProfileViewComponent}])
  ]
})
export class ProfileViewModule { }
