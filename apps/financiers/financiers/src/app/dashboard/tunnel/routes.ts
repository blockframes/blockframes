import { Routes } from '@angular/router';
import { TunnelGuard } from '@blockframes/ui/tunnel';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { TunnelStep } from '@blockframes/ui/tunnel';

const appSteps: TunnelStep[] = [{
  title: 'Financial Elements',
  icon: 'CAD',
  time: 10,
  routes: [
    { path: 'budget', label: 'Estimated Budget' },
    { path: 'fundings', label: 'Financing Plan' },
    { path: 'profits', label: 'Return on Investment' },
  ],
}, {
  title: 'Investment Campaign',
  icon: 'campaign',
  time: 10,
  routes: [
    { path: 'proposal', label: 'Investment Proposal' },
    { path: 'perks', label: 'Privileges' }
  ],
}];


export const titleTunnelRoutes: Routes = [
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
        path: 'shooting-information',
        loadChildren: () => import('@blockframes/movie/form/shooting-information/shooting-information.module').then(m => m.MovieFormShootingInformationModule)
      },
      {
        path: 'available-materials',
        loadChildren: () => import('@blockframes/movie/form/available-materials/available-materials.module').then(m => m.MovieFormAvailableMaterialsModule)
      },
      {
        path: 'technical-spec',
        loadChildren: () =>
          import('@blockframes/movie/form/technical-info/technical-info.module').then(m => m.TunnelTechnicalInfoModule)
      },
      {
        path: 'sales-pitch',
        loadChildren: () => import('@blockframes/movie/form/sales-pitch/sales-pitch.module').then(m => m.MovieFormSalesPitchModule)
      },
      {
        path: 'media-files',
        loadChildren: () => import('@blockframes/movie/form/media-files/media-files.module').then(m => m.MovieFormMediaFilesModule)
      },
      {
        path: 'media-notes',
        loadChildren: () => import('@blockframes/movie/form/media-notes/notes.module').then(m => m.MovieFormNotesModule)
      },
      {
        path: 'media-images',
        loadChildren: () => import('@blockframes/movie/form/media-images/media-images.module').then(m => m.MovieFormMediaImagesModule)
      },
      {
        path: 'media-videos',
        loadChildren: () => import('@blockframes/movie/form/media-videos/media-videos.module').then(m => m.MediaFormVideosModule)
      },

      // Financial Elements
      {
        path: 'budget',
        loadChildren: () => import('@blockframes/campaign/form/budget/budget.module').then(m => m.CampaignFormBudgetModule)
      },
      {
        path: 'fundings',
        loadChildren: () => import('@blockframes/campaign/form/fundings/fundings.module').then(m => m.CampaignFormFundingsModule)
      },
      {
        path: 'profits',
        loadChildren: () => import('@blockframes/campaign/form/profits/profits.module').then(m => m.CampaignFormProfitsModule)
      },

      // Campaign
      {
        path: 'proposal',
        loadChildren: () => import('@blockframes/campaign/form/proposal/proposal.module').then(m => m.CampaignFormProposalModule)
      },
      {
        path: 'perks',
        loadChildren: () => import('@blockframes/campaign/form/perks/perks.module').then(m => m.CampaignFormPerksModule)
      },

      // Summary
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
