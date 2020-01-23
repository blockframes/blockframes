import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';
import { MovieSummaryInformationComponent } from './information.component';

@NgModule({
  declarations: [MovieSummaryInformationComponent],
  imports: [
    CommonModule,
    MissingPipeModule
  ],
  exports: [MovieSummaryInformationComponent]
})
export class MovieSummaryInformationModule { }
