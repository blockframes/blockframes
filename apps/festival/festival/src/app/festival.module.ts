import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { MovieCollectionGuard } from '@blockframes/movie/guards/movie-collection.guard';
import { createRoutes } from '@blockframes/utils/routes/create-routes';
import { FestivalAppGuard } from './festival-app.guard';

// TODO: Add AppGuard

const routes: Routes = createRoutes({
  appName: 'festival',
  landing: {
    path: '',
    loadChildren: () => import('./landing/landing.module').then(m => m.FestivalLandingModule)
  },
  appsRoutes: [
    {
      path: '',
      redirectTo: 'marketplace',
      pathMatch: 'full'
    },
    {
      path: 'marketplace',
      canActivate: [FestivalAppGuard, MovieCollectionGuard],
      canDeactivate: [MovieCollectionGuard],
      loadChildren: () => import('./marketplace/marketplace.module').then(m => m.MarketplaceModule)
    },
    {
      path: 'dashboard',
      canActivate: [FestivalAppGuard],
      loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
      path: 'admin',
      loadChildren: () => import('@blockframes/admin/admin/admin.module').then(m => m.AdminModule)
    }
  ]
});

@NgModule({
  declarations: [],
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload',
    paramsInheritanceStrategy: 'always',
    relativeLinkResolution: 'corrected',
    preloadingStrategy: PreloadAllModules
  })],
})
export class FestivalModule {}
