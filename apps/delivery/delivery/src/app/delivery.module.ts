import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieOrganizationListGuard } from '@blockframes/movie/movie/guards/movie-organization-list.guard';

import { LayoutComponent } from './layout/layout.component';
import { createRoutes } from '@blockframes/utils/routes';
import { app } from '@blockframes/utils/apps';

export const routes: Routes = createRoutes({
  appName: app.mediaDelivering,
  landing: {
    path: '',
    redirectTo: 'c',
    pathMatch: 'full'
  },
  appsRoutes: [{
    path: '',
    component: LayoutComponent,
    children: [{
      path: '',
      redirectTo: app.mediaDelivering,
      pathMatch: 'full'
    }, {
      path: app.mediaDelivering,
      children: [{
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }, {
        path: 'home',
        canActivate: [MovieOrganizationListGuard],
        canDeactivate: [MovieOrganizationListGuard],
        loadChildren: () => import('./home/home.module').then(m => m.DeliveryHomeModule),
      }, {
        path: 'templates',
        loadChildren: () => import('@blockframes/material').then(m => m.TemplateModule)
      }, {
        path: 'movie',
        loadChildren: () => import('@blockframes/material').then(m => m.DeliveryModule)
      }]
    }]
  }]
});

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class DeliveryModule {}
