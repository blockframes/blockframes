import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MovieTunnelComponent } from "./movie-tunnel.component";

const tunnelRoutes: Routes = [
  {
    path: '',
    component: MovieTunnelComponent,
    children: [
      // Page 1
      {
        path: '',
        loadChildren: () => import('./start/start-tunnel.module').then(m => m.StartTunnelModule)
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
        loadChildren: () => import('./technical-info/technical-info.module').then(m => m.TunnelTechnicalInfoModule)
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(tunnelRoutes)
  ],
  exports: [RouterModule]
})
export class MovieTunnelRoutingModule { }
