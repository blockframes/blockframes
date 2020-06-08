
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { CookieBannerComponent } from './cookie-banner.component';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
  declarations: [CookieBannerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Material
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
  ],
  exports: [CookieBannerComponent]
})
export class CookieBannerModule { }
