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
        loadChildren: () => import('@blockframes/movie/pages/main/main.module').then(m => m.MovieFormMainModule)
      },
      // Page 3
      {
        path: 'synopsis',
        loadChildren: () => import('@blockframes/movie/pages/synopsis/synopsis.module').then(m => m.MovieFormSynopsisModule)
      },
      // Page 4
      {
        path: 'production',
        loadChildren: () => import('@blockframes/movie/pages/production/production.module').then(m => m.MovieFormProductionModule)
      },
      // Page 5
      {
        path: 'artistic',
        loadChildren: () => import('@blockframes/movie/pages/artistic/artistic.module').then(m => m.MovieFormArtisticModule)
      },
      // Page 6
      {
        path: 'reviews',
        loadChildren: () => import('@blockframes/movie/pages/reviews/reviews.module').then(m => m.MovieFormReviewsModule)
      },
      // Page 7
      {
        path: 'budget',
        loadChildren: () => import('@blockframes/movie/pages/budget/budget.module').then(m => m.BudgetModule)
      },
      // Page 8
      {
        path: 'technical-info',
        loadChildren: () =>
          import('@blockframes/movie/pages/technical-info/technical-info.module').then(m => m.TunnelTechnicalInfoModule)
      },
      // Page 10
      {
        path: 'images',
        loadChildren: () => import('@blockframes/movie/pages/media-image/media-image.module').then(m => m.MediaImageModule)
      // Page 11
      },
      {
        path: 'files&links',
        loadChildren: () => import('@blockframes/movie/pages/media-file/media-file.module').then(m => m.MediaFileModule)
      },
      {
        path: 'summary',
        loadChildren: () => import('@blockframes/movie/pages/summary/summary.module').then(m => m.TunnelSummaryModule)
      },
      // Last page
      {
        path: 'end',
        loadChildren: () => import('@blockframes/movie/pages/end/end.module').then(m => m.EndTunnelModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(tunnelRoutes)],
  exports: [RouterModule]
})
export class MovieTunnelRoutingModule {}
