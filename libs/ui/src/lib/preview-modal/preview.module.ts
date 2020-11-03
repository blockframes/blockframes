import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PreviewModalComponent } from './preview.component';
import { DialogModalModule } from './dialog-preview/dialog-preview.module';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    DialogModalModule
  ],
  exports: [PreviewModalComponent],
  declarations: [PreviewModalComponent],
})
export class PreviewModalModule { }
