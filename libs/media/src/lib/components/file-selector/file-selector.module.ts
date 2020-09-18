import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { FileSelectorComponent } from './file-selector.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [FileSelectorComponent],
  imports: [
    CommonModule,
    FileNameModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
  ],
  exports: [FileSelectorComponent],
})
export class FileSelectorModule { }
