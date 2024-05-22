
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { SafariBannerComponent } from './safari-banner.component';

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';


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
