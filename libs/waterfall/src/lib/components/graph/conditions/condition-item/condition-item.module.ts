
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ConditionToStringPipe, WaterfallConditionItemComponent } from './condition-item.component';

@NgModule({
  declarations: [WaterfallConditionItemComponent, ConditionToStringPipe],
  imports: [
    CommonModule,

    MatIconModule,
    MatButtonModule,
  ],
  exports: [WaterfallConditionItemComponent],
})
export class WaterfallConditionItemModule { }
