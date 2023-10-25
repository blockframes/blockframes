// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { SalesComponent } from './sales.component';

// Blockframes
import { SalesMapModule } from '@blockframes/waterfall/components/sales-map/sales-map.module';

@NgModule({
  declarations: [SalesComponent],
  imports: [
    CommonModule,

    SalesMapModule,

    // Routing
    RouterModule.forChild([{ path: '', component: SalesComponent }]),
  ],
})
export class SalesModule { }
