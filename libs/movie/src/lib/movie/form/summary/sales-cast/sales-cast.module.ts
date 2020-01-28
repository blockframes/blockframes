import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummarySalesCastComponent } from './sales-cast.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';

@NgModule({
  declarations: [MovieSummarySalesCastComponent],
  imports: [
    CommonModule,
    MissingControlModule
  ],
  exports: [MovieSummarySalesCastComponent]
})
export class MovieSummarySalesCastModule { }
