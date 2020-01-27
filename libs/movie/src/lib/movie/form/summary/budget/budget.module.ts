import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';
import { MovieSummaryBudgetComponent } from './budget.component';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';

@NgModule({
  declarations: [MovieSummaryBudgetComponent],
  imports: [
    CommonModule,
    MissingPipeModule,
    TranslateSlugModule
  ],
  exports: [MovieSummaryBudgetComponent]
})
export class MovieSummaryBudgetModule { }
