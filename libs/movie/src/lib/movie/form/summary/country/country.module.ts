import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryCountryComponent } from './country.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';

@NgModule({
  declarations: [MovieSummaryCountryComponent],
  imports: [
    CommonModule,
    MissingControlModule
  ],
  exports: [MovieSummaryCountryComponent]
})
export class MovieSummaryCountryModule { }
