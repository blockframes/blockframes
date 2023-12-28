
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

import { WaterfallConditionsComponent } from './conditions.component';
import { WaterfallConditionItemModule } from './condition-item/condition-item.module';
import { WaterfallConditionsFormModule } from '../../forms/conditions-form/conditions-form.module';


@NgModule({
  declarations: [ WaterfallConditionsComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    WaterfallConditionItemModule,
    WaterfallConditionsFormModule,

    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  exports: [ WaterfallConditionsComponent ],
})
export class WaterfallConditionsModule {}
