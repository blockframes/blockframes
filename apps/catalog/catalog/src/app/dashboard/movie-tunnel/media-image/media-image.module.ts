import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';
import { PromotionalElementsImagesModule } from '@blockframes/movie/movie/form/promotional-elements/promotional-elements-images/promotional-elements-images.module.ts';
import { MediaImageComponent } from './media-image.component';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [MediaImageComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    CropperModule,
    FlexLayoutModule,
    PromotionalElementsImagesModule,
    // Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    // Route
    RouterModule.forChild([{ path: '', component: MediaImageComponent }])
  ]
})
export class MediaImageModule { }
