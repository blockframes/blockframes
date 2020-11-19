// Angular
import { Routes } from '@angular/router';

// Blockframes
import { TunnelGuard } from '@blockframes/ui/tunnel';
import { productionStatus } from '@blockframes/utils/static-model/static-model'
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';

export const tunnelRoutes: Routes = [
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
        loadChildren: () => import('@blockframes/movie/form/title-status/title-status.module').then(m => m.TitleStatusModule),
        data: { disabled: Object.keys(productionStatus).filter(status => status !== 'released'), animation: 0 }
      },
      {
        path: 'main',
        loadChildren: () => import('@blockframes/movie/form/main/main.module').then(m => m.MovieFormMainModule),
        data: { animation: 1 }
      },
      {
        path: 'story-elements',
        loadChildren: () => import('@blockframes/movie/form/story-elements/story-elements.module').then(m => m.MovieFormStoryElementsModule),
        data: { animation: 2 }
      },
      {
        path: 'production',
        loadChildren: () => import('@blockframes/movie/form/production/production.module').then(m => m.MovieFormProductionModule),
        data: { animation: 3 }
      },
      {
        path: 'artistic',
        loadChildren: () => import('@blockframes/movie/form/artistic/artistic.module').then(m => m.MovieFormArtisticModule),
        data: { animation: 4 }
      },
      {
        path: 'reviews',
        loadChildren: () => import('@blockframes/movie/form/reviews/reviews.module').then(m => m.MovieFormReviewsModule),
        data: { animation: 5 }
      },
      {
        path: 'additional-information',
        loadChildren: () => import('@blockframes/movie/form/additional-information/additional-information.module').then(m => m.MovieFormAdditionalInformationModule),
        data: { animation: 6 }
      },
      {
        path: 'shooting-information',
        loadChildren: () => import('@blockframes/movie/form/shooting-information/shooting-information.module').then(m => m.MovieFormShootingInformationModule),
        data: { animation: 7 }
      },
      {
        path: 'technical-spec',
        loadChildren: () =>
          import('@blockframes/movie/form/technical-info/technical-info.module').then(m => m.TunnelTechnicalInfoModule),
          data: { animation: 8 }
      },
      {
        path: 'available-materials',
        loadChildren: () => import('@blockframes/movie/form/available-materials/available-materials.module').then(m => m.MovieFormAvailableMaterialsModule),
        data: { animation: 9 }
      },
      {
        path: 'sales-pitch',
        loadChildren: () => import('@blockframes/movie/form/sales-pitch/sales-pitch.module').then(m => m.MovieFormSalesPitchModule),
        data: { animation: 10 }
      },
      {
        path: 'media-files',
        loadChildren: () => import('@blockframes/movie/form/media-files/media-files.module').then(m => m.MovieFormMediaFilesModule),
        data: { animation: 11 }
      },
      {
        path: 'media-images',
        loadChildren: () => import('@blockframes/movie/form/media-images/media-images.module').then(m => m.MovieFormMediaImagesModule),
        data: { animation: 12 }
      },
      {
        path: 'media-videos',
        loadChildren: () => import('@blockframes/movie/form/media-videos/media-videos.module').then(m => m.MediaFormVideosModule),
        data: { animation: 13 }
      },
      {
        path: 'summary',
        loadChildren: () => import('./summary/summary.module').then(m => m.TunnelSummaryModule),
        data: { animation: 14 }
      },
      {
        path: 'end',
        loadChildren: () => import('@blockframes/movie/form/end/end.module').then(m => m.EndTunnelModule),
        data: { animation: 15 }
      }
    ]
  }
];
