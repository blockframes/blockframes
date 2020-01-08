import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TitleSalesComponent } from './sales.component';


@NgModule({
  declarations: [TitleSalesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: TitleSalesComponent }])
  ]
})
export class TitleSalesModule {}
