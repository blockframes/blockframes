import { Routes } from '@angular/router';
import { TunnelGuard } from '@blockframes/ui/tunnel';
import { CampaignFormShellComponent } from '@blockframes/campaign/form/shell/shell.component';


export const campaignTunnelRoutes: Routes = [
  {
    path: '',
    component: CampaignFormShellComponent,
    canDeactivate: [TunnelGuard],
    children: [
      {
        path: '',
        redirectTo: 'proposal',
        pathMatch: 'full'
      },
      {
        path: 'proposal',
        loadChildren: () => import('@blockframes/campaign/form/proposal/proposal.module').then(m => m.ProposalModule)
      },
      {
        path: 'perks',
        loadChildren: () => import('@blockframes/campaign/form/perks/perks.module').then(m => m.PerksModule)
      },
      {
        path: 'summary',
        loadChildren: () => import('./summary/summary.module').then(m => m.SummaryModule)
      }
    ]
  }
];
