import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TunnelGuard } from '@blockframes/ui/tunnel';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';

const tunnelRoutes: Routes = [
  {
    path: '',
    component: MovieFormShellComponent,
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
        path: 'story-elements',
        loadChildren: () => import('@blockframes/movie/form/story-elements/story-elements.module').then(m => m.MovieFormStoryElementsModule)
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
        path: 'technical-info',
        loadChildren: () =>
          import('@blockframes/movie/form/technical-info/technical-info.module').then(m => m.TunnelTechnicalInfoModule)
      },
      {
        path: 'images',
        loadChildren: () => import('@blockframes/movie/form/promotional-elements/media-images/media-images.module').then(m => m.MovieFormMediaImagesModule)
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
        loadChildren: () => import('./summary/summary.module').then(m => m.TunnelSummaryModule)
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
