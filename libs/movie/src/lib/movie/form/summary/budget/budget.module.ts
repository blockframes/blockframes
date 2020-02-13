import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryBudgetComponent } from './budget.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { TranslateSlugModule } from '@blockframes/utils';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MovieSummaryBudgetComponent],
  imports: [
    CommonModule,
    RouterModule,
    MissingControlModule,
    TranslateSlugModule
  ],
  exports: [MovieSummaryBudgetComponent]
})
export class MovieSummaryBudgetModule { }
