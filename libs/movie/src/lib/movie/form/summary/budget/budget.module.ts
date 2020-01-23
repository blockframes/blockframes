import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';
import { MovieSummaryBudgetComponent } from './budget.component';

@NgModule({
  declarations: [MovieSummaryBudgetComponent],
  imports: [
    CommonModule,
    MissingPipeModule
  ],
  exports: [MovieSummaryBudgetComponent]
})
export class MovieSummaryBudgetModule { }
