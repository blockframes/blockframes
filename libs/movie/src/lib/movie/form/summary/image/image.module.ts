import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryImageComponent } from './image.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MovieSummaryImageComponent],
  imports: [
    CommonModule,
    RouterModule,
    MissingControlModule
  ],
  exports: [MovieSummaryImageComponent]
})
export class MovieSummaryImageModule { }
