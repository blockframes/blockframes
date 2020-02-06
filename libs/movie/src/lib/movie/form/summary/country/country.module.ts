import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryCountryComponent } from './country.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [MovieSummaryCountryComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MissingControlModule
  ],
  exports: [MovieSummaryCountryComponent]
})
export class MovieSummaryCountryModule { }
