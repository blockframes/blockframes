import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryCountryComponent } from './country.component';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';
import { MissingSlugPipeModule } from '@blockframes/utils/pipes/missing-slug.module';

@NgModule({
  declarations: [MovieSummaryCountryComponent],
  imports: [
    CommonModule,
    MissingPipeModule,
    MissingSlugPipeModule
  ],
  exports: [MovieSummaryCountryComponent]
})
export class MovieSummaryCountryModule { }
