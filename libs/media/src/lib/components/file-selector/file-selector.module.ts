import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { MediaViewerModule } from '@blockframes/media/components/dialog/file-viewer/viewer.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { FileSelectorComponent } from './file-selector.component';
import { MaxLengthModule } from '@blockframes/utils/pipes';

// Material
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [FileSelectorComponent],
  imports: [
    CommonModule,
    FileNameModule,
    MaxLengthModule,
    FlexLayoutModule,
    MediaViewerModule,

    MatExpansionModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatTabsModule,
    MatListModule,
    MatTooltipModule,
  ],
  exports: [FileSelectorComponent],
})
export class FileSelectorModule { }
