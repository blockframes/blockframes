import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';
import { MediaImageComponent } from './media-image.component';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [MediaImageComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    CropperModule,
    FlexLayoutModule,
    // Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    // Route
    RouterModule.forChild([{ path: '', component: MediaImageComponent }])
  ]
})
export class MediaImageModule { }
