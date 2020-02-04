import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// Modules
import { CatalogTunnelComponent } from './catalog-tunnel.component';

const routes: Routes = [
  {
    path: '',
    component: CatalogTunnelComponent,
    children: [
      // Page 1
      {
        path: '',
        redirectTo: 'type',
        pathMatch: 'full'
      },
      {
        path: 'type',
        loadChildren: () => import('./type/type.module').then(m => m.TunnelTypeModule)
      }
    ]
  }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class CatalogTunnelRoutingModule {}
