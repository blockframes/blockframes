import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryInformationComponent } from './information.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';

@NgModule({
  declarations: [MovieSummaryInformationComponent],
  imports: [
    CommonModule,
    MissingControlModule
  ],
  exports: [MovieSummaryInformationComponent]
})
export class MovieSummaryInformationModule { }
