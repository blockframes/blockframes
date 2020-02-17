// Angular
import { NgModule } from '@angular/core';
import { RouterModule, NoPreloading } from '@angular/router';
// Components
import { LayoutComponent } from './layout/layout.component';
import { AppGridComponent } from './app-grid/app-grid.component';
// Routes utils
import { App } from '@blockframes/utils';
import { MaintenanceGuard } from '@blockframes/ui/maintenance';

const routes = [{
  path: '',
  component: AppGridComponent,
  canActivate: [MaintenanceGuard],
},{
  path: 'catalog',
  loadChildren: () => import('@blockframes/apps/catalog/catalog.module').then(m => m.CatalogModule)
},
{
  path: App.mediaDelivering,
  data: { app: App.mediaDelivering },
  loadChildren: () => import('@blockframes/apps/delivery/delivery.module').then(m => m.DeliveryModule)
}]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always',
      preloadingStrategy: NoPreloading
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
