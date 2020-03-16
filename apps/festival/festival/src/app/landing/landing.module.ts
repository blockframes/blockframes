import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing.component';



@NgModule({
  declarations: [LandingComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: LandingComponent }])
  ]
})
export class LandingModule { }
