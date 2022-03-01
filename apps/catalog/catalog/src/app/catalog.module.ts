import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { createRoutes } from '@blockframes/utils/routes/create-routes';

// Guards
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';
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
    canActivate: [ModuleGuard],
    loadChildren: () => import('./marketplace/marketplace.module').then(m => m.MarketplaceModule)
  },
  {
    path: 'dashboard',
    canActivate: [ModuleGuard],
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  }
]
});

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
})
export class CatalogModule { }
