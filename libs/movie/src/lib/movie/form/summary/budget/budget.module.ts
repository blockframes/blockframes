import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryBudgetComponent } from './budget.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { TranslateSlugModule } from '@blockframes/utils';

@NgModule({
  declarations: [MovieSummaryBudgetComponent],
  imports: [
    CommonModule,
    MissingControlModule,
    TranslateSlugModule
  ],
  exports: [MovieSummaryBudgetComponent]
})
export class MovieSummaryBudgetModule { }
