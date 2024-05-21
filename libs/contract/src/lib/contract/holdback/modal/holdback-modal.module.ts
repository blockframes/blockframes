
import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

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
