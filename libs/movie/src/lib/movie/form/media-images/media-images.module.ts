import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

// Blockframes UI
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';

// Blockframes Movie
import { PromotionalLinksModule } from '@blockframes/movie/form/links/promotional-links.module';

// Blockframes Media
import { FileNewUploaderModule } from '@blockframes/media/file/file-new-uploader/file-uploader.module';
import { ImageNewUploaderModule } from '@blockframes/media/image/uploader-new/uploader.module';

import { MovieFormMediaImagesComponent } from './media-images.component';


@NgModule({
  declarations: [MovieFormMediaImagesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    PromotionalLinksModule,
    FileNewUploaderModule,
    FormTableModule,
    ImageNewUploaderModule,
    FlexLayoutModule,

    // Material
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: MovieFormMediaImagesComponent }])
  ],
  exports: [MovieFormMediaImagesComponent]
})
export class MovieFormMediaImagesModule { }
