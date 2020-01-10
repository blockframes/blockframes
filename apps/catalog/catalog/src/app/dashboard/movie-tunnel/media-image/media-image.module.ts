import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';
import { MediaImageComponent } from './media-image.component';

// Material
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [MediaImageComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    CropperModule,
    // Material
    MatCardModule,
    // Route
    RouterModule.forChild([{ path: '', component: MediaImageComponent }])
  ]
})
export class MediaImageModule { }
