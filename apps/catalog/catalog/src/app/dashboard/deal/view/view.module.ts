import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealViewComponent } from './view.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [DealViewComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DealViewComponent
      }
    ])
  ]
})
export class DealViewModule {}
