import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

export const deliveryAppRoutes: Routes = [
  {
    path: '',
    redirectTo: 'delivery',
    pathMatch: 'full'
  },
  {
    path: 'templates',
    loadChildren: () => import('@blockframes/material').then(m => m.TemplateModule)
  },
  {
    path: 'delivery',
    loadChildren: () => import('@blockframes/material').then(m => m.DeliveryModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(deliveryAppRoutes)]
})
export class DeliveryAppModule {
  constructor() {
    console.log('DeliveryAppModule');
  }
}
