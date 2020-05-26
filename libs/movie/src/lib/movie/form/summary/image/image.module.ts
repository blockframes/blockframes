import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryImageComponent } from './image.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { RouterModule } from '@angular/router';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';

@NgModule({
  declarations: [MovieSummaryImageComponent],
  imports: [
    CommonModule,
    RouterModule,
    FileNameModule,
    MissingControlModule
  ],
  exports: [MovieSummaryImageComponent]
})
export class MovieSummaryImageModule { }
