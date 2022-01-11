import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestScreeningComponent } from './request-screening.component';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  declarations: [RequestScreeningComponent],
  exports: [RequestScreeningComponent]
})
export class RequestScreeningModule {}