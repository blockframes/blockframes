import { Routes } from '@angular/router';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';

export const tunnelRoutes: Routes = [
  {
    path: '',
    component: MovieFormShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'title-status',
        pathMatch: 'full'
      },
      {
        path: 'title-status',
        data: { animation: 0 },
        loadChildren: () => import('@blockframes/movie/form/title-status/title-status.module').then(m => m.TitleStatusModule),
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
        path: 'artistic',
        data: { animation: 4 },
        loadChildren: () => import('@blockframes/movie/form/artistic/artistic.module').then(m => m.MovieFormArtisticModule),
      },
      {
        path: 'reviews',
        data: { animation: 5 },
        loadChildren: () => import('@blockframes/movie/form/reviews/reviews.module').then(m => m.MovieFormReviewsModule),
      },
      {
        path: 'additional-information',
        data: { animation: 6 },
        loadChildren: () => import('@blockframes/movie/form/additional-information/additional-information.module').then(m => m.MovieFormAdditionalInformationModule),
      },
      {
        path: 'shooting-information',
        data: { animation: 7 },
        loadChildren: () => import('@blockframes/movie/form/shooting-information/shooting-information.module').then(m => m.MovieFormShootingInformationModule),
      },
      {
        path: 'technical-spec',
        data: { animation: 8 },
        loadChildren: () =>
          import('@blockframes/movie/form/technical-info/technical-info.module').then(m => m.TunnelTechnicalInfoModule),
      },
      {
        path: 'available-materials',
        data: { animation: 9 },
        loadChildren: () => import('@blockframes/movie/form/available-materials/available-materials.module').then(m => m.MovieFormAvailableMaterialsModule),
      },
      {
        path: 'sales-pitch',
        data: { animation: 10 },
        loadChildren: () => import('@blockframes/movie/form/sales-pitch/sales-pitch.module').then(m => m.MovieFormSalesPitchModule),
      },
      {
        path: 'media-files',
        data: { animation: 11 },
        loadChildren: () => import('@blockframes/movie/form/media-files/media-files.module').then(m => m.MovieFormMediaFilesModule),
      },
      {
        path: 'media-notes',
        data: { animation: 12 },
        loadChildren: () => import('@blockframes/movie/form/media-notes/notes.module').then(m => m.MovieFormNotesModule),
      },
      {
        path: 'media-images',
        data: { animation: 13 },
        loadChildren: () => import('@blockframes/movie/form/media-images/media-images.module').then(m => m.MovieFormMediaImagesModule),
      },
      {
        path: 'media-videos',
        data: { animation: 14 },
        loadChildren: () => import('@blockframes/movie/form/media-videos/media-videos.module').then(m => m.MediaFormVideosModule),
      },
      {
        path: 'summary',
        data: { animation: 15 },
        loadChildren: () => import('./summary/summary.module').then(m => m.TunnelSummaryModule),
      }
    ]
  }
];
