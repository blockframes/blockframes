import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestScreeningComponent } from './request-screening.component';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  declarations: [RequestScreeningComponent],
  exports: [RequestScreeningComponent]
})
export class RequestScreeningModule {}