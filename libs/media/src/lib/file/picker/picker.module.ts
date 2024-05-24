import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { FilePreviewModule } from '../preview/preview.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { FilePickerComponent } from './picker.component';
import { MaxLengthModule } from '@blockframes/utils/pipes';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [FilePickerComponent],
  imports: [
    CommonModule,
    FileNameModule,
    MaxLengthModule,
    FlexLayoutModule,
    FilePreviewModule,
    GlobalModalModule,

    MatExpansionModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatTabsModule,
    MatListModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  exports: [FilePickerComponent],
})
export class FilePickerModule { }
