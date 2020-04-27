import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryInformationComponent } from './information.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { RuntimeModule } from '@blockframes/utils/pipes/runtime.module';

@NgModule({
  declarations: [MovieSummaryInformationComponent],
  imports: [
    CommonModule,
    RuntimeModule,
    MissingControlModule
  ],
  exports: [MovieSummaryInformationComponent]
})
export class MovieSummaryInformationModule { }
