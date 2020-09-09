import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryEvaluationComponent } from './evaluation.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';

@NgModule({
  declarations: [MovieSummaryEvaluationComponent],
  imports: [
    CommonModule,
    MissingControlModule
  ],
  exports: [MovieSummaryEvaluationComponent]
})
export class MovieSummaryEvaluationModule { }
