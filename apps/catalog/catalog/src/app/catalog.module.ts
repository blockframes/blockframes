import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovieCollectionGuard } from '@blockframes/movie/guards/movie-collection.guard';
import { createRoutes } from '@blockframes/utils/routes/create-routes';

// Guards
import { CatalogAppGuard } from './guards/catalog-app.guard';
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
    canActivate: [CatalogAppGuard, MovieCollectionGuard],
    canDeactivate: [MovieCollectionGuard],
    loadChildren: () => import('./marketplace/marketplace.module').then(m => m.MarketplaceModule)
  },
  {
    path: 'dashboard',
    canActivate: [CatalogAppGuard],
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('@blockframes/admin/admin/admin.module').then(m => m.AdminModule)
  }]
});

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
})
export class CatalogModule { }
