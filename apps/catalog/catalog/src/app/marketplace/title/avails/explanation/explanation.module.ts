import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExplanationComponent } from './explanation.component';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatTabsModule,
    GlobalModalModule
  ],
  declarations: [ExplanationComponent],
  exports: [],
})
export class ExplanationModule { }
