
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

// Component
import { CookieBannerComponent } from './cookie-banner.component';
import { CookieDialogModule } from '../cookie-dialog/cookie-dialog.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [CookieBannerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    ImageModule,
    
    // Material
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatIconModule,
    CookieDialogModule
  ],
  exports: [CookieBannerComponent]
})
export class CookieBannerModule { }
