import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingSlugPipeModule } from '@blockframes/utils';
import { MovieSummaryEvaluationComponent } from './evaluation.component';

@NgModule({
  declarations: [MovieSummaryEvaluationComponent],
  imports: [
    CommonModule,
    MissingSlugPipeModule,
  ],
  exports: [MovieSummaryEvaluationComponent]
})
export class MovieSummaryEvaluationModule { }
