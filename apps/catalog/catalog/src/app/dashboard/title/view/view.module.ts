import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewComponent } from './view.component';
import { RouterModule } from '@angular/router';

const routes = [{
  path: '',
  component: ViewComponent,
  children: [
    {
      path: 'sales',
      loadChlidren: () => import('../sales/sales.module').then(m => m.SalesModule)
    },
    {
      path: 'details',
      loadChlidren: () => import('../details/details.module').then(m => m.DetailsModule)
    },
    {
      path: 'avails',
      loadChlidren: () => import('../avails/avails.module').then(m => m.AvailsModule)
    }
  ]
}];

@NgModule({
  declarations: [ViewComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class TitleViewModule {}
