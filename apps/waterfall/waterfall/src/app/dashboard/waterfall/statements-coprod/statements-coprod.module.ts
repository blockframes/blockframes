// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { StatementsCoprodComponent } from './statements-coprod.component';

@NgModule({
  declarations: [StatementsCoprodComponent],
  imports: [
    CommonModule,

    // Material

    // Routing
    RouterModule.forChild([{ path: '', component: StatementsCoprodComponent }]),
  ],
})
export class StatementsCoprodModule { }
