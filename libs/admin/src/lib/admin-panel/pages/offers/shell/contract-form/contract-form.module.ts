import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractFormComponent } from './contract-form.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@angular/flex-layout';

// @blockframes
import { AvailsFilterModule } from '@blockframes/contract/term/form/filter/avails/avails-filter.module';
import { FormTableModule } from "@blockframes/ui/form/table/form-table.module";

@NgModule({
  declarations: [ContractFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ContractFormComponent }]),
    ReactiveFormsModule,
    AvailsFilterModule,
    FormTableModule,
    
    // Material
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FlexLayoutModule
  ]
})
export class ContractFormModule { }
