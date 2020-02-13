import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryCreditComponent } from './credit.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { TranslateSlugModule } from '@blockframes/utils';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MovieSummaryCreditComponent],
  imports: [
    CommonModule,
    RouterModule,
    MissingControlModule,
    TranslateSlugModule
  ],
  exports: [MovieSummaryCreditComponent]
})
export class MovieSummaryCreditModule { }
