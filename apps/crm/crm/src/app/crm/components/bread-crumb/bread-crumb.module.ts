import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components 
import { BreadCrumbComponent } from './bread-crumb.component';

@NgModule({
  declarations: [
    BreadCrumbComponent
  ],
  exports: [
    BreadCrumbComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
  ]
})
export class BreadCrumbModule { }
