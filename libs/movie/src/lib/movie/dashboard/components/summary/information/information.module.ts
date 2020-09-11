import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryInformationComponent } from './information.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';

@NgModule({
  declarations: [MovieSummaryInformationComponent],
  imports: [
    CommonModule,
    DurationModule,
    MissingControlModule
  ],
  exports: [MovieSummaryInformationComponent]
})
export class MovieSummaryInformationModule { }
