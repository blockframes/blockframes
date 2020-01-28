import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryImageComponent } from './image.component';

@NgModule({
  declarations: [MovieSummaryImageComponent],
  imports: [
    CommonModule,
  ],
  exports: [MovieSummaryImageComponent]
})
export class MovieSummaryImageModule { }
