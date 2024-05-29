import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DetailedGroupComponent } from './detailed.component';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    ToLabelModule,
    GlobalModalModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  exports: [DetailedGroupComponent],
  declarations: [DetailedGroupComponent],
})
export class DetailedGroupModule {}
