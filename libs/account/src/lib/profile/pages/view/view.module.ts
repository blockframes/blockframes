import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { ProfileFormModule } from '@blockframes/account/profile/forms/profile/profile.module';
import { PasswordFormModule } from '@blockframes/account/profile/forms/password/password.module';
import { ProfileViewComponent } from './view.component';

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
    ImgAssetModule,
    ProfileFormModule,
    PasswordFormModule,
    // Material
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: ProfileViewComponent}])
  ]
})
export class ProfileViewModule { }
