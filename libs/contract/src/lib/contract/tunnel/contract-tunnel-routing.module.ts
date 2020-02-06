import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },{
    path: 'overview',
    loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule)
  },{
    path: 'sale',
    children: [{
      path: 'details',
    }, {
      path: 'summary',
      loadChildren: () => import('./summary-sale/summary-sale.module').then(m => m.SummarySaleModule)
    }]
  },{
    path: 'mandate',
    children: [{
      path: 'details',
      loadChildren: () => import('./details-mandate/details-mandate.module').then(m => m.DetailsMandateModule)
    }, {
      path: 'summary',
      loadChildren: () => import('./summary-mandate/summary-mandate.module').then(m => m.SummaryMandateModule)
    }]
  },{
    path: 'deals/:titleId',
    
  }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ContractTunnelRoutingModule {}
