import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryFestivalPrizesComponent } from './festival-prizes.component';
import { MissingControlModule } from '@blockframes/ui';

@NgModule({
  declarations: [MovieSummaryFestivalPrizesComponent],
  imports: [
    CommonModule,
    MissingControlModule
  ],
  exports: [MovieSummaryFestivalPrizesComponent]
})
export class MovieSummaryFestivalPrizesModule { }
