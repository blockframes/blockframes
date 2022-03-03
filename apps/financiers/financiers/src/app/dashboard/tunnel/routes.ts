import { Routes } from '@angular/router';
import { TunnelGuard } from '@blockframes/ui/tunnel';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { TunnelStep } from '@blockframes/ui/tunnel';
import { MovieShellGuard } from '@blockframes/movie/guards/movie-shell.guard';

const disclaimer = `We kindly remind you that all the following elements will appear on the marketplace once you submit your project.
Please make sure that you have the right to share this information with potential future investors.`

const appSteps: TunnelStep[] = [{
  title: 'Financial Elements',
  icon: 'CAD',
  time: 10,
  routes: [
    { path: 'budget', label: 'Budget', disclaimer },
    { path: 'fundings', label: 'Financing Plan', disclaimer },
    { path: 'profits', label: 'Return on Investment', disclaimer },
  ],
}, {
  title: 'Investment Campaign',
  icon: 'campaign',
  time: 10,
  routes: [
    { path: 'proposal', label: 'Investment Proposal', disclaimer },
    { path: 'perks', label: 'Privileges', disclaimer }
  ],
}];


export const titleTunnelRoutes: Routes = [
  {
    path: '',
    component: MovieFormShellComponent,
    canActivate: [MovieShellGuard],
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
        path: 'media-notes',
        data: { animation: 11 },
        loadChildren: () => import('@blockframes/movie/form/media-notes/notes.module').then(m => m.MovieFormNotesModule),
      },
      {
        path: 'media-images',
        data: { animation: 12 },
        loadChildren: () => import('@blockframes/movie/form/media-images/media-images.module').then(m => m.MovieFormMediaImagesModule),
      },
      {
        path: 'media-videos',
        data: { animation: 13 },
        loadChildren: () => import('@blockframes/movie/form/media-videos/media-videos.module').then(m => m.MediaFormVideosModule),
      },

      // Financial Elements
      {
        path: 'budget',
        data: { animation: 14 },
        loadChildren: () => import('@blockframes/campaign/form/budget/budget.module').then(m => m.CampaignFormBudgetModule),
      },
      {
        path: 'fundings',
        data: { animation: 15 },
        loadChildren: () => import('@blockframes/campaign/form/fundings/fundings.module').then(m => m.CampaignFormFundingsModule),
      },
      {
        path: 'profits',
        data: { animation: 16 },
        loadChildren: () => import('@blockframes/campaign/form/profits/profits.module').then(m => m.CampaignFormProfitsModule),
      },

      // Campaign
      {
        path: 'proposal',
        data: { animation: 17 },
        loadChildren: () => import('@blockframes/campaign/form/proposal/proposal.module').then(m => m.CampaignFormProposalModule),
      },
      {
        path: 'perks',
        data: { animation: 18 },
        loadChildren: () => import('@blockframes/campaign/form/perks/perks.module').then(m => m.CampaignFormPerksModule),
      },

      // Summary
      {
        path: 'summary',
        data: { animation: 19 },
        loadChildren: () => import('./summary/summary.module').then(m => m.TunnelSummaryModule),
      },
      {
        path: 'end',
        data: { animation: 20 },
        loadChildren: () => import('@blockframes/movie/form/end/end.module').then(m => m.EndTunnelModule),
      },
    ]
  }
];
