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
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
