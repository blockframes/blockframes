import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@blockframes/auth/guard/auth.guard';
import { OrganizationGuard } from '@blockframes/organization/guard/organization.guard';
import { PermissionsGuard } from '@blockframes/permissions/guard/permissions.guard';
import { MaintenanceGuard } from '@blockframes/ui/maintenance/maintenance.guard';
import { RouteOptions } from '@blockframes/utils/routes/create-routes';
import { IdlePreload, IdlePreloadModule } from 'angular-idle-preload';

export function createAdminRoutes({ appsRoutes }: RouteOptions): Routes {
  return [
    {
      path: 'maintenance',
      canActivate: [MaintenanceGuard],
      loadChildren: () => import('@blockframes/ui/maintenance/maintenance.module').then(m => m.MaintenanceModule)
    },
    {
      path: '',
      canActivate: [MaintenanceGuard],
      children: [
        { path: '', redirectTo: 'auth', pathMatch: 'full' },
        {
          path: 'auth',
          loadChildren: () => import('@blockframes/auth/auth.module').then(m => m.AuthModule)
        },
        {
          path: 'c',
          canActivate: [AuthGuard],
          canDeactivate: [AuthGuard],
          children: [
            {
              path: '',
              redirectTo: 'o',
              pathMatch: 'full'
            },
            {
              // The redirection route when user has no organization
              path: 'organization',
              loadChildren: () => import('@blockframes/organization/no-organization.module').then(m => m.NoOrganizationModule)
            },
            {
              path: 'o',
              canActivate: [PermissionsGuard, OrganizationGuard],
              children: appsRoutes
            }
          ]
        },
        {
          path: 'not-found',
          loadChildren: () => import('@blockframes/ui/error/error-not-found.module').then(m => m.ErrorNotFoundModule)
        },
        {
          path: '**',
          loadChildren: () => import('@blockframes/ui/error/error-not-found.module').then(m => m.ErrorNotFoundModule)
        }
      ]
    }];
}

const routes = createAdminRoutes({
  appsRoutes: [{
    path: '',
    loadChildren: () => import('./shell/shell.module').then(m => m.ShellModule)
  }]
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
      relativeLinkResolution: 'corrected',
      preloadingStrategy: IdlePreload
    })],
})
export class CmsModule { }
