import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TitleAvailsComponent } from './avails.component';


@NgModule({
  declarations: [TitleAvailsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: TitleAvailsComponent }])
  ]
})
export class TitleAvailsModule { }
