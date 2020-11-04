import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { FileSelectorComponent } from './file-selector.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MaxLengthModule } from '@blockframes/utils/pipes';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [FileSelectorComponent],
  imports: [
    CommonModule,
    FileNameModule,
    MaxLengthModule,
    FlexLayoutModule,

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
