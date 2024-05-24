import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExplanationComponent } from './explanation.component';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

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
