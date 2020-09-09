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
        loadChildren: () => import('@blockframes/movie/form/main/main.module').then(m => m.MovieFormMainModule)
      },
      {
        path: 'synopsis',
        loadChildren: () => import('@blockframes/movie/form/synopsis/synopsis.module').then(m => m.MovieFormSynopsisModule)
      },
      // Page 4
      {
        path: 'credits',
        loadChildren: () => import('@blockframes/movie/form/credits/credits.module').then(m => m.CreditsModule)
      },
      // Page 5
      {
        path: 'budget',
        loadChildren: () => import('@blockframes/movie/form/budget/budget.module').then(m => m.BudgetModule)
      },
      // Page 6
      {
        path: 'technical-info',
        loadChildren: () =>
          import('@blockframes/movie/form/technical-info/technical-info.module').then(m => m.TunnelTechnicalInfoModule)
      },
      // Page 10
      {
        path: 'images',
        loadChildren: () => import('@blockframes/movie/form/media-image/media-image.module').then(m => m.MediaImageModule)
      // Page 11
      },
      {
        path: 'files&links',
        loadChildren: () => import('@blockframes/movie/form/media-file/media-file.module').then(m => m.MediaFileModule)
      },
      // Page 12.1
      {
        path: 'chain',
        loadChildren: () => import('./chain-of-titles/chain-of-titles.module').then(m => m.ChainOfTitlesModule)
      },
      // Page 12.2
      {
        path: 'evaluation',
        loadChildren: () => import('./evaluation/evaluation.module').then(m => m.EvaluationModule)
      },
      {
        path: 'summary',
        loadChildren: () => import('@blockframes/movie/form/summary/summary.module').then(m => m.TunnelSummaryModule)
      },
      // Last page
      {
        path: 'end',
        loadChildren: () => import('@blockframes/movie/form/end/end.module').then(m => m.EndTunnelModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(tunnelRoutes)],
  exports: [RouterModule]
})
export class MovieTunnelRoutingModule {}
