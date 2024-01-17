
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { WaterfallStepItemComponent } from './step-item.component';


@NgModule({
  declarations: [ WaterfallStepItemComponent ],
  imports: [
    CommonModule,

    MatIconModule,
    MatButtonModule,
  ],
  exports: [ WaterfallStepItemComponent ],
})
export class WaterfallStepItemModule {}
