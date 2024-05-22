
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';

import { WaterfallRightListComponent } from './right-list.component';
import { WaterfallPoolModalModule } from '../pool-modal/pool-modal.module';


@NgModule({
  declarations: [ WaterfallRightListComponent ],
  imports: [
    ReactiveFormsModule,
    CommonModule,

    WaterfallPoolModalModule,

    MatIconModule,
    MatChipsModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatFormFieldModule,
  ],
  exports: [ WaterfallRightListComponent ],
})
export class WaterfallRightListModule {}
