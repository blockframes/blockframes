
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { CellModalComponent } from './cell-modal.component';
import { GlobalModalModule } from '../global-modal/global-modal.module';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    GlobalModalModule
  ],
  exports: [CellModalComponent],
  declarations: [CellModalComponent]
})
export class CellModalModule { }
