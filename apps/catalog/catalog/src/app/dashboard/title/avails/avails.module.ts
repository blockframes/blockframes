import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvailsComponent } from './avails.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [AvailsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AvailsComponent }])
  ]
})
export class AvailsModule { }
