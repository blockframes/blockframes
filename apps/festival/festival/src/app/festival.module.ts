import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovieCollectionGuard } from '@blockframes/movie/movie/guards/movie-collection.guard';
import { createRoutes } from '@blockframes/utils/routes';

// TODO: Add AppGuard

const routes: Routes = createRoutes({
  appName: 'festival',
  // landing: {
  //   path: '',
  //   loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule)
  // },
  appsRoutes: [{
    path: '',
    redirectTo: 'marketplace',
    pathMatch: 'full'
  },
  {
    path: 'marketplace',
    canActivate: [MovieCollectionGuard],
    canDeactivate: [MovieCollectionGuard],
    loadChildren: () => import('./marketplace/marketplace.module').then(m => m.MarketplaceModule)
  },
  // {
  //   path: 'dashboard',
  //   canActivate: [CatalogAppGuard],
  //   loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  // },
  {
    path: 'admin',
    loadChildren: () => import('@blockframes/admin').then(m => m.AdminModule)
  }]
});

@NgModule({
  declarations: [],
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload',
    paramsInheritanceStrategy: 'always',
    relativeLinkResolution: 'corrected'
  })],
})
export class FestivalModule {}
