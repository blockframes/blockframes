import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// Modules
import { ContractTunnelComponent } from './contract-tunnel.component';

const routes: Routes = [
  {
    path: '',
    component: ContractTunnelComponent,
    children: []
  }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ContractTunnelRoutingModule {}
