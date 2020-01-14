// Angular
import { NgModule } from '@angular/core';
import { RouterModule, NoPreloading } from '@angular/router';
// Components
import { LayoutComponent } from './layout/layout.component';
import { AppGridComponent } from './app-grid/app-grid.component';
// Routes utils
import { App } from '@blockframes/utils';
import { createRoutes } from '@blockframes/utils/routes';


const routes = [{
  path: '',
  component: AppGridComponent
},{
  path: 'catalog',
  loadChildren: () => import('@blockframes/apps/catalog/catalog.module').then(m => m.CatalogModule)
},
{
  path: App.mediaDelivering,
  data: { app: App.mediaDelivering },
  loadChildren: () => import('@blockframes/apps/delivery').then(m => m.DeliveryAppModule)
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
