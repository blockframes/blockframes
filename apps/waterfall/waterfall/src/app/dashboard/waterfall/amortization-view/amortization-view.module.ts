// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { AmortizationViewComponent } from './amortization-view.component';

@NgModule({
  declarations: [AmortizationViewComponent],
  imports: [
    CommonModule,

    // Material

    // Routing
    RouterModule.forChild([{ path: '', component: AmortizationViewComponent }]),
  ],
})
export class AmortizationViewModule { }
