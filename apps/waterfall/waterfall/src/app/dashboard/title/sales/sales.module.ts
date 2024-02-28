// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { SalesComponent } from './sales.component';

// Blockframes
import { SalesMapModule } from '@blockframes/waterfall/components/sales-map/sales-map.module';
import { SalesListModule } from '@blockframes/waterfall/components/sales-list/sales-list.module';
import { WaterfallAdminGuard } from '@blockframes/waterfall/guards/waterfall-admin.guard';

@NgModule({
  declarations: [SalesComponent],
  imports: [
    CommonModule,

    SalesMapModule,
    SalesListModule,

    // Routing
    RouterModule.forChild([{
      path: '',
      canActivate: [WaterfallAdminGuard],
      component: SalesComponent
    }]),
  ],
})
export class SalesModule { }
