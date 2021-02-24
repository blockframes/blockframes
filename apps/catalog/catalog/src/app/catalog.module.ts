import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovieCollectionGuard } from '@blockframes/movie/guards/movie-collection.guard';
import { createRoutes } from '@blockframes/utils/routes/create-routes';

// Guards
import { AppGuard } from '@blockframes/utils/routes/app.guard';
import { NoAuthGuard } from '@blockframes/auth/guard/no-auth.guard';

const routes: Routes = createRoutes({
  appName: 'catalog',
  landing: {
    path: '',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./landing/landing.module').then(m => m.CatalogLandingModule)
  },
  appsRoutes: [{
    path: '',
    redirectTo: 'marketplace',
    pathMatch: 'full'
  },
  {
    path: 'marketplace',
    canActivate: [AppGuard, MovieCollectionGuard],
    canDeactivate: [MovieCollectionGuard],
    loadChildren: () => import('./marketplace/marketplace.module').then(m => m.MarketplaceModule)
  },
  {
    path: 'dashboard',
    canActivate: [AppGuard],
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'request-access',
    loadChildren: () => import('@blockframes/organization/pages/request-access/request-access.module').then(m => m.OrgRequestAccessModule)
  }
]
});

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
})
export class CatalogModule { }
