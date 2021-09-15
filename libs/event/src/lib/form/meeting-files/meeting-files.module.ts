import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MeetingFilesComponent } from './meeting-files.component';
import { FilePickerModule } from '@blockframes/media/file/picker/picker.module';
import { EventEditModule as LayoutEventEditModule } from '@blockframes/event/layout/edit/edit.module';
import { FilePreviewModule } from '@blockframes/media/file/preview/preview.module';

// Material
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [MeetingFilesComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    LayoutEventEditModule,
    FilePickerModule,
    FileNameModule,
    FilePreviewModule,

    // Material
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ]
})
export class MeetingFilesModule { }
