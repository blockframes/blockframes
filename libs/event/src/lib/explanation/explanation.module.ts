import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExplanationComponent } from './explanation.component';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    GlobalModalModule
  ],
  declarations: [ExplanationComponent],
  exports: [],
})
export class ExplanationModule { }
