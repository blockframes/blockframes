import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DetailedGroupComponent } from './detailed.component';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
