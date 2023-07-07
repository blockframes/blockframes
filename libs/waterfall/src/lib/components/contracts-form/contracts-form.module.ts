import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { ContractsFormComponent } from './contracts-form.component';

// Blockframes
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    ContractsFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StaticSelectModule,

    // Material
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,

  ],
  exports: [
    ContractsFormComponent
  ]
})
export class ContractsFormModule { }
