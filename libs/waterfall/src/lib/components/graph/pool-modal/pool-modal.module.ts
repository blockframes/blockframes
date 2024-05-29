
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

import { WaterfallPoolModalComponent } from './pool-modal.component';

@NgModule({
  declarations: [WaterfallPoolModalComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    GlobalModalModule,

    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTooltipModule
  ],
  exports: [WaterfallPoolModalComponent],
})
export class WaterfallPoolModalModule { }
