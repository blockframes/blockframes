// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Components
import { LayoutComponent } from './layout/layout.component';
// Guards
import { AuthGuard } from '@blockframes/auth';
import { HomeComponent } from './home/home.component';
import { OrganizationGuard, PermissionsGuard } from '@blockframes/organization';

import { createAppRoutes } from '@blockframes/utils/routes';

export const mainAppRoutes: Routes = [{
  path: 'delivery',
  loadChildren: () => import('@blockframes/apps/delivery').then(m => m.DeliveryAppModule)
}]

// export const routes: Routes = [
//   { path: '', redirectTo: 'layout', pathMatch: 'full' },
//   {
//     path: 'auth',
//     loadChildren: () => import('@blockframes/auth').then(m => m.AuthModule)
//   },
//   {
//     path: 'layout',
//     component: LayoutComponent,
//     canActivate: [AuthGuard],
//     canDeactivate: [AuthGuard],
//     children: [
//       {
//         path: '',
//         redirectTo: 'o',
//         pathMatch: 'full'
//       },
//       {
//         // The redirection route when user has no organization
//         path: 'organization',
//         loadChildren: () => import('@blockframes/organization').then(m => m.NoOrganizationModule)
//       },
//       {
//         path: 'o',
//         canActivate: [PermissionsGuard, OrganizationGuard],
//         canDeactivate: [PermissionsGuard, OrganizationGuard],
//         children: [
//           {
//             path: '',
//             redirectTo: 'home',
//             pathMatch: 'full'
//           },
//           {
//             path: 'organization',
//             loadChildren: () => import('@blockframes/organization').then(m => m.OrganizationModule)
//           },
//           {
//             path: 'account',
//             loadChildren: () => import('@blockframes/account').then(m => m.AccountModule)
//           },
//           {
//             path: 'home',
//             component: HomeComponent
//           },
//         ]
//       }
//     ]
//   },
//   {
//     path: 'not-found',
//     loadChildren: () => import('@blockframes/ui').then(m => m.ErrorNotFoundModule)
//   },
//   {
//     path: '**',
//     loadChildren: () => import('@blockframes/ui').then(m => m.ErrorNotFoundModule)
//   }
// ];

const routes = createAppRoutes(mainAppRoutes, LayoutComponent);

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
