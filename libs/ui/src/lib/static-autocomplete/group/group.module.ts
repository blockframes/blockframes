import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticGroupComponent, TriggerDisplayValue } from './group.component';
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { MatRippleModule } from "@angular/material/core";
import { MatTooltipModule } from '@angular/material/tooltip';
import { GetModePipeModule, ToLabelModule } from '@blockframes/utils/pipes';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    GetModePipeModule,
    MatInputModule,
    MatDividerModule,
    MatRippleModule,
    MatTooltipModule,
    ToLabelModule,
  ],
  declarations: [StaticGroupComponent, TriggerDisplayValue],
  exports: [StaticGroupComponent]
})
export class StaticGroupModule { }
