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
      {
        path: '',
        redirectTo: 'title-status',
        pathMatch: 'full'
      },
      {
        path: 'title-status',
        loadChildren: () => import('@blockframes/movie/form/title-status/title-status.module').then(m => m.TitleStatusModule)
      },
      {
        path: 'main',
        loadChildren: () => import('@blockframes/movie/form/main/main.module').then(m => m.MovieFormMainModule)
      },
      {
        path: 'synopsis',
        loadChildren: () => import('@blockframes/movie/form/synopsis/synopsis.module').then(m => m.MovieFormSynopsisModule)
      },
      {
        path: 'production',
        loadChildren: () => import('@blockframes/movie/form/production/production.module').then(m => m.MovieFormProductionModule)
      },
      {
        path: 'artistic',
        loadChildren: () => import('@blockframes/movie/form/artistic/artistic.module').then(m => m.MovieFormArtisticModule)
      },
      {
        path: 'reviews',
        loadChildren: () => import('@blockframes/movie/form/reviews/reviews.module').then(m => m.MovieFormReviewsModule)
      },
      {
        path: 'additional-information',
        loadChildren: () => import('@blockframes/movie/form/additional-information/additional-information.module').then(m => m.MovieFormAdditionalInformationModule)
      },
      {
        path: 'available-materials',
        loadChildren: () => import('@blockframes/movie/form/available-materials/available-materials.module').then(m => m.MovieFormAvailableMaterialsModule)
      },
      {
        path: 'budget',
        loadChildren: () => import('@blockframes/movie/form/budget/budget.module').then(m => m.BudgetModule)
      },
      {
        path: 'technical-info',
        loadChildren: () =>
          import('@blockframes/movie/form/technical-info/technical-info.module').then(m => m.TunnelTechnicalInfoModule)
      },
      {
        path: 'images',
        loadChildren: () => import('@blockframes/movie/form/media-image/media-image.module').then(m => m.MediaImageModule)
      },
      {
        path: 'media-files',
        loadChildren: () => import('@blockframes/movie/form/promotional-elements/media-files/media-files.module').then(m => m.MovieFormMediaFilesModule)
      },
      {
        path: 'media-images',
        loadChildren: () => import('@blockframes/movie/form/promotional-elements/media-images/media-images.module').then(m => m.MovieFormMediaImagesModule)
      },
      {
        path: 'media-videos',
        loadChildren: () => import('@blockframes/movie/form/promotional-elements/media-videos/media-videos.module').then(m => m.MediaFormVideosModule)
      },
      {
        path: 'summary',
        loadChildren: () => import('@blockframes/movie/form/summary/summary.module').then(m => m.TunnelSummaryModule)
      },
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
export class MovieTunnelRoutingModule { }
