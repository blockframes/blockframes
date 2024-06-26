import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { createRoutes } from '@blockframes/utils/routes/create-routes';
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';
import { NoAuthGuard } from '@blockframes/auth/guard/no-auth.guard';
import { IdlePreload, IdlePreloadModule } from 'angular-idle-preload';
import { AnonymousAuthGuard } from '@blockframes/auth/guard/anonymous-auth-guard';

const routes = createRoutes({
  landing: {
    path: '',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./landing/landing.module').then(m => m.FestivalLandingModule)
  },
  appsRoutes: [
    {
      path: '',
      redirectTo: 'dashboard',
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
  ],
  events: {
    path: 'event',
    canActivate: [AnonymousAuthGuard],
    loadChildren: () => import('./event/event.module').then(m => m.EventModule)
  },
  organization: {
    path: 'organization',
    canActivate: [AnonymousAuthGuard],
    loadChildren: () => import('./organization/organization.module').then(m => m.OrganizationModule)
  }
});

@NgModule({
  declarations: [],
  exports: [RouterModule],
  imports: [
    IdlePreloadModule.forRoot(),
    RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload',
    paramsInheritanceStrategy: 'always',
    preloadingStrategy: IdlePreload
})],
})
export class FestivalModule { }
