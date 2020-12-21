import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ContractTunnelComponent } from './contract-tunnel.component';

const routes: Routes = [{
  path: 'sale',
  component: ContractTunnelComponent,
  children: [{
    path: '',
    redirectTo: 'details',
    pathMatch: 'full'
  }, {
    path: 'details',
    loadChildren: () => import('./details-sale/details-sale.module').then(m => m.DetailsSaleModule)
  }, {
    path: 'summary',
    loadChildren: () => import('./summary-sale/summary-sale.module').then(m => m.SummarySaleModule)
  }, {
    path: ':titleId',
    loadChildren: () => import('./right/right.module').then(m => m.RightModule)
  }]
}, {
  path: 'mandate',
  component: ContractTunnelComponent,
  children: [{
    path: '',
    redirectTo: 'details',
    pathMatch: 'full'
  }, {
    path: 'details',
    loadChildren: () => import('./details-mandate/details-mandate.module').then(m => m.DetailsMandateModule)
  }, {
    path: 'summary',
    loadChildren: () => import('./summary-mandate/summary-mandate.module').then(m => m.SummaryMandateModule)
  }, {
    path: ':titleId',
    loadChildren: () => import('./right/right.module').then(m => m.RightModule)
  }]
}];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ContractTunnelRoutingModule { }
