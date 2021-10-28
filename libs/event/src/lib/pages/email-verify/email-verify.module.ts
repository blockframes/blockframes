import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailVerifyComponent } from './email-verify.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [EmailVerifyComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    AppLogoModule,
    MatIconModule,
    ImageModule,

    RouterModule.forChild([{ path: '', component: EmailVerifyComponent }]),
  ]
})
export class EmailVerifyModule { }
