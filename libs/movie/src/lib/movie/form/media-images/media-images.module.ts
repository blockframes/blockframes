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

// Blockframes Media
import { FileListPipeModule } from '@blockframes/media/file/pipes/file-list.pipe';
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';

import { MovieFormMediaImagesComponent } from './media-images.component';


@NgModule({
  declarations: [MovieFormMediaImagesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    FileUploaderModule,
    FileListPipeModule,
    FormTableModule,
    ImageUploaderModule,
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
