import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryCreditComponent } from './credit.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';

@NgModule({
  declarations: [MovieSummaryCreditComponent],
  imports: [
    CommonModule,
    MissingControlModule
  ],
  exports: [MovieSummaryCreditComponent]
})
export class MovieSummaryCreditModule { }
