import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';
import { MovieSummaryFileComponent } from './file.component';

@NgModule({
  declarations: [MovieSummaryFileComponent],
  imports: [
    CommonModule,
    MissingPipeModule
  ],
  exports: [MovieSummaryFileComponent]
})
export class MovieSummaryFileModule { }
