import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewComponent } from './view.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [ViewComponent],
  imports: [
    CommonModule,
  ]
})
export class TitleViewModule { }
