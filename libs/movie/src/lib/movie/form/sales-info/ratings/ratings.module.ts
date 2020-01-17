import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RatingComponent } from './rating.component';



@NgModule({
  declarations: [RatingComponent],
  exports: [RatingComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class MovieFormRatingModule { }
