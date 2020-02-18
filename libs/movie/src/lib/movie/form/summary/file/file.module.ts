import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryFileComponent } from './file.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';

@NgModule({
  declarations: [MovieSummaryFileComponent],
  imports: [
    CommonModule,
    MissingControlModule
  ],
  exports: [MovieSummaryFileComponent]
})
export class MovieSummaryFileModule { }
