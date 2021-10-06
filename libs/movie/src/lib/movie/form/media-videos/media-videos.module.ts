import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieFormMediaVideosComponent } from './media-videos.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';
import { FileNameModule, ToLabelModule } from '@blockframes/utils/pipes';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';
import { FileListPipeModule } from '@blockframes/media/file/pipes/file-list.pipe';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [MovieFormMediaVideosComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    FlexLayoutModule,
    FormListModule,
    MaxLengthModule,
    FileUploaderModule,
    FileNameModule,
    FileListPipeModule,
    StaticSelectModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,

    //Modules
    ToLabelModule,

    // Route
    RouterModule.forChild([{ path: '', component: MovieFormMediaVideosComponent }])
  ]
})
export class MediaFormVideosModule { }
