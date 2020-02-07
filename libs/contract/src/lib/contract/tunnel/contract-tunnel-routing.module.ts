import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ContractTunnelComponent } from './contract-tunnel.component';
import { TunnelGuard } from '@blockframes/ui/tunnel';

const routes: Routes = [{
  path: '',
  component: ContractTunnelComponent,
  canDeactivate: [TunnelGuard],
  children: [{
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  }, {
    path: 'overview',
    loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule)
  }, {
    path: 'sale',
    children: [{
      path: 'details',
      loadChildren: () => import('./details-sale/details-sale.module').then(m => m.DetailsSaleModule)
    }, {
      path: 'summary',
      loadChildren: () => import('./summary-sale/summary-sale.module').then(m => m.SummarySaleModule)
    }]
  }, {
    path: 'mandate',
    children: [{
      path: 'details',
      loadChildren: () => import('./details-mandate/details-mandate.module').then(m => m.DetailsMandateModule)
    }, {
      path: 'summary',
      loadChildren: () => import('./summary-mandate/summary-mandate.module').then(m => m.SummaryMandateModule)
    }]
  }, {
    path: 'deals/:titleId',

  }]
}];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ContractTunnelRoutingModule { }
