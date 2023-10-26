// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { StatementsDistribComponent } from './statements-distrib.component';

@NgModule({
  declarations: [StatementsDistribComponent],
  imports: [
    CommonModule,

    // Material

    // Routing
    RouterModule.forChild([{ path: '', component: StatementsDistribComponent }]),
  ],
})
export class StatementDistribModule { }
