// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Components
import { AmortizationComponent } from './amortization.component';
import { DashboardWaterfallShellModule } from '@blockframes/waterfall/dashboard/shell/shell.module';


const routes: Routes = [{
  path: ':amortizationId',
  component: AmortizationComponent,
  children: [
    {
      path: '',
      loadChildren: () => import('@blockframes/waterfall/components/amortization/edit/edit.module').then(m => m.WaterfallEditAmortizationModule),
    },
    {
      path: 'summary',
      loadChildren: () => import('@blockframes/waterfall/components/amortization/summary/summary.module').then(m => m.WaterfallSummaryAmortizationModule),
    },
  ]
}];

@NgModule({
  declarations: [AmortizationComponent],
  imports: [
    CommonModule,

    // Blockframes
    DashboardWaterfallShellModule,

    // Routes
    RouterModule.forChild(routes),
  ],
})
export class AmortizationModule { }
