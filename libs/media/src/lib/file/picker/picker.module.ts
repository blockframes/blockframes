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
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

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
