import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractViewComponent } from './contract-view.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [ContractViewComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ContractViewComponent }]),
  ]
})
export class ContractViewModule { }
