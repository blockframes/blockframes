
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { WaterfallConditionItemComponent } from './condition-item.component';


@NgModule({
  declarations: [ WaterfallConditionItemComponent ],
  imports: [
    CommonModule,

    MatIconModule,
    MatButtonModule,
  ],
  exports: [ WaterfallConditionItemComponent ],
})
export class WaterfallConditionItemModule {}
