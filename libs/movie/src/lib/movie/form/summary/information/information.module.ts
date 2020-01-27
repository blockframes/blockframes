import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';
import { MovieSummaryInformationComponent } from './information.component';
import { MissingSlugPipeModule } from '@blockframes/utils/pipes/missing-slug.module';

@NgModule({
  declarations: [MovieSummaryInformationComponent],
  imports: [
    CommonModule,
    MissingPipeModule,
    MissingSlugPipeModule
  ],
  exports: [MovieSummaryInformationComponent]
})
export class MovieSummaryInformationModule { }
