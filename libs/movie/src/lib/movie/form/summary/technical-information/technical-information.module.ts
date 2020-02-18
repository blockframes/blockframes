import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryTechnicalInformationComponent } from './technical-information.component';
import { TranslateSlugModule } from '@blockframes/utils';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MovieSummaryTechnicalInformationComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslateSlugModule,
    MissingControlModule
  ],
  exports: [MovieSummaryTechnicalInformationComponent]
})
export class MovieSummaryTechnicalInformationModule { }
