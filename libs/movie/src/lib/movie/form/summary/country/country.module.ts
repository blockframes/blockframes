import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryCountryComponent } from './country.component';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';

@NgModule({
  declarations: [MovieSummaryCountryComponent],
  imports: [
    CommonModule,
    MissingPipeModule
  ],
  exports: [MovieSummaryCountryComponent]
})
export class MovieSummaryCountryModule { }
