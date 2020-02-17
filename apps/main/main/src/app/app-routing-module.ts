// Angular
import { NgModule } from '@angular/core';
import { RouterModule, NoPreloading } from '@angular/router';
// Components
import { LayoutComponent } from './layout/layout.component';
import { AppGridComponent } from './app-grid/app-grid.component';
// Routes utils
import { App } from '@blockframes/utils';
import { MaintenanceGuard } from '@blockframes/ui/maintenance';

const routes = [
  {
    path: '',
    component: AppGridComponent,
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'maintenance',
    canActivate: [MaintenanceGuard],
    loadChildren: () => import('@blockframes/ui/maintenance').then(m => m.MaintenanceModule)
  }
];

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
