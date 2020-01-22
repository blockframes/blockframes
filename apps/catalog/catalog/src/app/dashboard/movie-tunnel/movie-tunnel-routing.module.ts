import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovieTunnelComponent } from './movie-tunnel.component';

const tunnelRoutes: Routes = [
  {
    path: '',
    component: MovieTunnelComponent,
    children: [
      // Page 1
      {
        path: 'start',
        loadChildren: () => import('./start/start-tunnel.module').then(m => m.StartTunnelModule)
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
      {
        path: 'keywords',
        loadChildren: () => import('./keywords/keywords.module').then(m => m.TunnelKeywordsModule)
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
      // Page 9
      {
        path: 'previous-deals',
        loadChildren: () =>
          import('./previous-deals/previous-deals.module').then(m => m.TunnelPreviousDealsModule)
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
