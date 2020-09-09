import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryFileComponent } from './file.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';

@NgModule({
  declarations: [MovieSummaryFileComponent],
  imports: [
    CommonModule,
    FileNameModule,
    MissingControlModule,
  ],
  exports: [MovieSummaryFileComponent]
})
export class MovieSummaryFileModule { }
