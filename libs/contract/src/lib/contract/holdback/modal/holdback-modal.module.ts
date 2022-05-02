
import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { HoldbackListModule } from '../list/list.module';
import { HoldbackModalComponent } from './holdback-modal.component';

@NgModule({
  imports: [
    CommonModule,
    HoldbackListModule,
    GlobalModalModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
  exports: [HoldbackModalComponent],
  declarations: [HoldbackModalComponent]
})
export class HoldbackModalModule { }
