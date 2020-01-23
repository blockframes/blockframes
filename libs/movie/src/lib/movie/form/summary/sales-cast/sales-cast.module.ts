import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummarySalesCastComponent } from './sales-cast.component';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';

@NgModule({
  declarations: [MovieSummarySalesCastComponent],
  imports: [
    CommonModule,
    MissingPipeModule
  ],
  exports: [MovieSummarySalesCastComponent]
})
export class MovieSummarySalesCastModule { }
