import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { ToLabelModule } from '@blockframes/utils/pipes';

import { MissingControlComponent } from './missing-control.component';

@NgModule({
  imports: [
    CommonModule,

    MatButtonModule,
    MatTooltipModule,

    ToLabelModule,

    RouterModule,
  ],
  declarations: [MissingControlComponent],
  exports: [MissingControlComponent]
})
export class MissingControlModule {}
