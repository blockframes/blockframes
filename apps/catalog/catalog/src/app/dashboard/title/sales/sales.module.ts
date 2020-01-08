import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesComponent } from './sales.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [SalesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: SalesComponent }])
  ]
})
export class SalesModule { }
