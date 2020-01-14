import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ContractFormPartyNameComponent } from './party-name.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [ContractFormPartyNameComponent],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  exports: [ContractFormPartyNameComponent]
})
export class ContractFormPartyNameModule {}
