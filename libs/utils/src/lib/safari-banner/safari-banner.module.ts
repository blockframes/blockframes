
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { SafariBannerComponent } from './safari-banner.component';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
  declarations: [SafariBannerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Material
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
  ],
  exports: [SafariBannerComponent]
})
export class SafariBannerModule { }
