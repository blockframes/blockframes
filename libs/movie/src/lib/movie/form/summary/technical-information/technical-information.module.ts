import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';
import { MatChipsModule } from '@angular/material/chips';
import { MovieSummaryTechnicalInformationComponent } from './technical-information.component';
import { TranslateSlugModule } from '@blockframes/utils';

@NgModule({
  declarations: [MovieSummaryTechnicalInformationComponent],
  imports: [
    CommonModule,
    MissingPipeModule,
    TranslateSlugModule,
    MatChipsModule
  ],
  exports: [MovieSummaryTechnicalInformationComponent]
})
export class MovieSummaryTechnicalInformationModule { }
