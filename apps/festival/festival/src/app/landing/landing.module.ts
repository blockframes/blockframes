import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { LandingComponent } from './landing.component';
import { LandingModule } from '@blockframes/landing/landing.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// TODO REMOVE THAT
import { CookieFormModule } from '@blockframes/utils/gdpr-cookie/cookie-form/cookie-form.module';

@NgModule({
  declarations: [LandingComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    LandingModule,
    ImageReferenceModule,
    CookieFormModule,

    // Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: LandingComponent }]),

    CookieFormModule,
  ]
})
export class FestivalLandingModule { }
