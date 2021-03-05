// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Blockframes
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { FileListPipeModule } from '@blockframes/media/file/pipes/file-list.pipe.ts';
import { FormDisplayNameModule } from '@blockframes/ui/form/display-name/display-name.module';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';
import { MaxLengthModule } from '@blockframes/utils/pipes';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { MovieFormMediaNotesComponent } from './notes.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: MovieFormMediaNotesComponent }]),
    TunnelPageModule,
    FlexLayoutModule,
    FormDisplayNameModule,
    FormListModule,
    FileNameModule,
    MaxLengthModule,
    FileUploaderModule,
    FileListPipeModule,

    // Material
    MatFormFieldModule,
    MatSelectModule
  ],
  declarations: [MovieFormMediaNotesComponent],
})
export class MovieFormNotesModule { }
