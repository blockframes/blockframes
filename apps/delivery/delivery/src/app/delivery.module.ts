import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { deliveryAppRoutes } from './app-routing-module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(deliveryAppRoutes)]
})
export class DeliveryAppModule {}
