import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovieTunnelComponent } from './movie-tunnel.component';
import { TunnelGuard } from '@blockframes/ui/tunnel';

const tunnelRoutes: Routes = [
  {
    path: '',
    component: MovieTunnelComponent,
    canDeactivate: [TunnelGuard],
    children: [
      // Page 1
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      // Page 2
      {
        path: 'main',
        loadChildren: () => import('./main/main.module').then(m => m.MainTunnelModule)
      },
      {
        path: 'synopsis',
        loadChildren: () => import('./synopsis/synopsis.module').then(m => m.TunnelSynopsisModule)
      },
      // Page 4
      {
        path: 'credits',
        loadChildren: () => import('./credits/credits.module').then(m => m.CreditsModule)
      },
      // Page 5
      {
        path: 'budget',
        loadChildren: () => import('./budget/budget.module').then(m => m.BudgetModule)
      },
      // Page 6
      {
        path: 'technical-info',
        loadChildren: () =>
          import('./technical-info/technical-info.module').then(m => m.TunnelTechnicalInfoModule)
      },
      // Page 10
      {
        path: 'images',
        loadChildren: () => import('./media-image/media-image.module').then(m => m.MediaImageModule)
      // Page 11
      },
      {
        path: 'files&links',
        loadChildren: () => import('./media-file/media-file.module').then(m => m.MediaFileModule)
      },
      {
        path: 'summary',
        loadChildren: () => import('./summary/summary.module').then(m => m.TunnelSummaryModule)
      },
      // Last page
      {
        path: 'end',
        loadChildren: () => import('./end/end.module').then(m => m.EndTunnelModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(tunnelRoutes)],
  exports: [RouterModule]
})
export class MovieTunnelRoutingModule {}
