import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryBudgetComponent } from './budget.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.pipe';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [MovieSummaryBudgetComponent],
  imports: [
    CommonModule,
    RouterModule,
    MissingControlModule,
    TranslateSlugModule,
    FlexLayoutModule,
    MatIconModule
  ],
  exports: [MovieSummaryBudgetComponent]
})
export class MovieSummaryBudgetModule { }
