import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieOrganizationListGuard } from '@blockframes/movie/movie/guards/movie-organization-list.guard';

import { LayoutComponent } from './layout/layout.component';
import { createRoutes } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils/apps';

export const routes: Routes = createRoutes({
  appName: App.mediaDelivering,
  appsRoutes: [{
    path: '',
    component: LayoutComponent,
    children: [{
      path: '',
      redirectTo: App.mediaDelivering,
      pathMatch: 'full'
    }, {
      path: App.mediaDelivering,
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
