
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaterfallConditionsReadOnlyComponent } from './read-only.component';
import { WaterfallStepItemModule } from './../step-item/step-item.module';
import { WaterfallConditionItemModule } from './../condition-item/condition-item.module';
import { WaterfallConditionsFormModule } from '../../../forms/conditions-form/conditions-form.module';

@NgModule({
  declarations: [WaterfallConditionsReadOnlyComponent],
  imports: [
    CommonModule,

    WaterfallStepItemModule,
    WaterfallConditionItemModule,
    WaterfallConditionsFormModule,
  ],
  exports: [WaterfallConditionsReadOnlyComponent],
})
export class WaterfallConditionsReadOnlyModule { }
