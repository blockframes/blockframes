import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExplanationComponent } from './explanation.component';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    GlobalModalModule
  ],
  declarations: [ExplanationComponent],
  exports: [],
})
export class ExplanationModule { }
