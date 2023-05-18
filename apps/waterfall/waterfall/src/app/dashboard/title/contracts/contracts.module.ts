// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { ContractsComponent } from './contracts.component';

@NgModule({
  declarations: [ContractsComponent],
  imports: [
    CommonModule,

    // Material

    // Routing
    RouterModule.forChild([{ path: '', component: ContractsComponent }]),
  ],
})
export class ContractsModule { }
