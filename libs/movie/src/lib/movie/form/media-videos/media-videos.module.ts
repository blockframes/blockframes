import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieFormMediaVideosComponent } from './media-videos.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';
import { FileNameModule } from '@blockframes/utils/pipes';
import { FileNewUploaderModule } from '@blockframes/media/file/file-new-uploader/file-uploader.module';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [MovieFormMediaVideosComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    FlexLayoutModule,
    FormListModule,
    MaxLengthModule,
    FileNewUploaderModule,
    FileNameModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,

    // Route
    RouterModule.forChild([{ path: '', component: MovieFormMediaVideosComponent }])
  ]
})
export class MediaFormVideosModule { }
