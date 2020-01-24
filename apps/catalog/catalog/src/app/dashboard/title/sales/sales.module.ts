import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from "ng-apexcharts";
import { FlexLayoutModule } from '@angular/flex-layout';

import { TitleSalesComponent } from './sales.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
@NgModule({
  declarations: [TitleSalesComponent],
  imports: [
    CommonModule,
    NgApexchartsModule,
    FlexLayoutModule,
    // Material
    MatCardModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: TitleSalesComponent }])
  ]
})
export class TitleSalesModule {}
