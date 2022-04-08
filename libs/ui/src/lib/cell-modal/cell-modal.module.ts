
import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { CellModalComponent } from './cell-modal.component';


@NgModule({
  imports: [
    CommonModule,

    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
  exports: [CellModalComponent],
  declarations: [CellModalComponent]
})
export class CellModalModule { }
