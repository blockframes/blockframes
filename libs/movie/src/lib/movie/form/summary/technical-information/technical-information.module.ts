import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryTechnicalInformationComponent } from './technical-information.component';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { RouterModule } from '@angular/router';
import { VersionPipeModule } from '@blockframes/utils/pipes/version.pipe';

@NgModule({
  declarations: [MovieSummaryTechnicalInformationComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslateSlugModule,
    MissingControlModule,
    VersionPipeModule
  ],
  exports: [MovieSummaryTechnicalInformationComponent]
})
export class MovieSummaryTechnicalInformationModule { }
