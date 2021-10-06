// Angular
import { Routes } from '@angular/router';

// Blockframes
import { TunnelGuard, TunnelStep } from '@blockframes/ui/tunnel';
import { productionStatus } from '@blockframes/utils/static-model/static-model'
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';

const appSteps: TunnelStep[] = [{
  title: 'Delivery List',
  icon: 'archive',
  time: 10,
  routes: [{
    path: 'available-materials',
    label: 'Available Materials',
  },
  ]
}];

export const tunnelRoutes: Routes = [
  {
    path: '',
    component: MovieFormShellComponent,
    canDeactivate: [TunnelGuard],
    data: { appSteps },
    children: [
      {
        path: '',
        redirectTo: 'title-status',
        pathMatch: 'full'
      },
      {
        path: 'title-status',
        data: { disabled: Object.keys(productionStatus).filter(status => status !== 'released'), animation: 0 },
        loadChildren: () => import('@blockframes/movie/form/title-status/title-status.module').then(m => m.TitleStatusModule)
      },
      {
        path: 'main',
        data: { animation: 1 },
        loadChildren: () => import('@blockframes/movie/form/main/main.module').then(m => m.MovieFormMainModule),
      },
      {
        path: 'story-elements',
        data: { animation: 2 },
        loadChildren: () => import('@blockframes/movie/form/story-elements/story-elements.module').then(m => m.MovieFormStoryElementsModule),
      },
      {
        path: 'production',
        data: { animation: 3 },
        loadChildren: () => import('@blockframes/movie/form/production/production.module').then(m => m.MovieFormProductionModule),
      },
      {
        path: 'shooting-information',
        data: { animation: 4 },
        loadChildren: () => import('@blockframes/movie/form/shooting-information/shooting-information.module').then(m => m.MovieFormShootingInformationModule),
      },
      {
        path: 'artistic',
        data: { animation: 5 },
        loadChildren: () => import('@blockframes/movie/form/artistic/artistic.module').then(m => m.MovieFormArtisticModule),
      },
      {
        path: 'reviews',
        data: { animation: 6 },
        loadChildren: () => import('@blockframes/movie/form/reviews/reviews.module').then(m => m.MovieFormReviewsModule),
      },
      {
        path: 'additional-information',
        data: { animation: 7 },
        loadChildren: () => import('@blockframes/movie/form/additional-information/additional-information.module').then(m => m.MovieFormAdditionalInformationModule),
      },
      {
        path: 'technical-spec',
        data: { animation: 8 },
        loadChildren: () => import('@blockframes/movie/form/technical-info/technical-info.module').then(m => m.TunnelTechnicalInfoModule),
      },
      {
        path: 'available-versions',
        data: { animation: 9 },
        loadChildren: () => import('@blockframes/movie/form/available-versions/available-versions.module').then(m => m.MovieFormAvailableVersionsModule),
      },
      {
        path: 'media-files',
        data: { animation: 10 },
        loadChildren: () => import('@blockframes/movie/form/media-files/media-files.module').then(m => m.MovieFormMediaFilesModule),
      },
      {
        path: 'media-images',
        data: { animation: 11 },
        loadChildren: () => import('@blockframes/movie/form/media-images/media-images.module').then(m => m.MovieFormMediaImagesModule),
      },
      {
        path: 'media-videos',
        data: { animation: 12 },
        loadChildren: () => import('@blockframes/movie/form/media-videos/media-videos.module').then(m => m.MediaFormVideosModule),
      },
      {
        path: 'available-materials',
        data: { animation: 13 },
        loadChildren: () => import('@blockframes/movie/form/available-materials/available-materials.module').then(m => m.MovieFormAvailableMaterialsModule),
      },
      {
        path: 'summary',
        data: { animation: 14 },
        loadChildren: () => import('./summary/summary.module').then(m => m.TunnelSummaryModule),
      },
      {
        path: 'end',
        data: { animation: 15 },
        loadChildren: () => import('@blockframes/movie/form/end/end.module').then(m => m.EndTunnelModule),
      }
    ]
  }
];
