import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DashboardComponent } from './dashboard.component';

@NgModule({
  imports: [CommonModule],
  exports: [DashboardComponent],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
