import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';
import { MovieSummaryImageComponent } from './image.component';

@NgModule({
  declarations: [MovieSummaryImageComponent],
  imports: [
    CommonModule,
    MissingPipeModule
  ],
  exports: [MovieSummaryImageComponent]
})
export class MovieSummaryImageModule { }
