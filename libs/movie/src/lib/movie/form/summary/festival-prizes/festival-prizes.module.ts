import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryFestivalPrizesComponent } from './festival-prizes.component';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';

@NgModule({
  declarations: [MovieSummaryFestivalPrizesComponent],
  imports: [
    CommonModule,
    MissingPipeModule
  ],
  exports: [MovieSummaryFestivalPrizesComponent]
})
export class MovieSummaryFestivalPrizesModule { }
