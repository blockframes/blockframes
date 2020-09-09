import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryImageComponent } from './image.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { RouterModule } from '@angular/router';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { EmptyImagePipeModule } from '@blockframes/media/directives/image-reference/image-reference.pipe';

@NgModule({
  declarations: [MovieSummaryImageComponent],
  imports: [
    CommonModule,
    RouterModule,
    FileNameModule,
    MissingControlModule,
    EmptyImagePipeModule,
  ],
  exports: [MovieSummaryImageComponent]
})
export class MovieSummaryImageModule { }
