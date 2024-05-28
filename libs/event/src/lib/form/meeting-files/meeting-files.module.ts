import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MeetingFilesComponent } from './meeting-files.component';
import { FilePickerModule } from '@blockframes/media/file/picker/picker.module';
import { EventFromShellModule } from '../shell/shell.module';
import { FilePreviewModule } from '@blockframes/media/file/preview/preview.module';
import { RouterModule } from '@angular/router';

// Material
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [MeetingFilesComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    EventFromShellModule,
    FilePickerModule,
    FileNameModule,
    FilePreviewModule,
    RouterModule.forChild([{ path: '', component: MeetingFilesComponent }]),

    // Material
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
  ]
})
export class MeetingFilesModule { }
