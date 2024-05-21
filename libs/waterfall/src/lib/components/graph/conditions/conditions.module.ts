
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';

import { WaterfallConditionsComponent } from './conditions.component';
import { WaterfallStepItemModule } from './step-item/step-item.module';
import { WaterfallConditionItemModule } from './condition-item/condition-item.module';
import { WaterfallConditionsFormModule } from '../../forms/conditions-form/conditions-form.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';


@NgModule({
  declarations: [WaterfallConditionsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    WaterfallStepItemModule,
    WaterfallConditionItemModule,
    WaterfallConditionsFormModule,
    StaticSelectModule,

    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
  ],
  exports: [WaterfallConditionsComponent],
})
export class WaterfallConditionsModule { }
