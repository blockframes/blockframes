import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestScreeningComponent } from './request-screening.component';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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