import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieFormMediaScreenerComponent } from './media-screener.component';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';

@NgModule({
  declarations: [MovieFormMediaScreenerComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    FileUploaderModule,
    
    // Route
    RouterModule.forChild([{ path: '', component: MovieFormMediaScreenerComponent }])
  ]
})
export class MediaFormScreenerModule { }
