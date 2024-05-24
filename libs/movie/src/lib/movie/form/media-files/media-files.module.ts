import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

// Blockframes UI
import { TunnelPageModule } from '@blockframes/ui/tunnel';

// Blockframes Media
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';

import { MovieFormMediaFilesComponent } from './media-files.component';


@NgModule({
  declarations: [MovieFormMediaFilesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    FileUploaderModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: MovieFormMediaFilesComponent }])
  ],
  exports: [MovieFormMediaFilesComponent]
})
export class MovieFormMediaFilesModule { }
