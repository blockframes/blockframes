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
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';

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
