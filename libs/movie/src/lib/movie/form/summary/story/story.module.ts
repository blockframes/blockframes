import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';
import { MovieSummaryStoryComponent } from './story.component';

@NgModule({
  declarations: [MovieSummaryStoryComponent],
  imports: [
    CommonModule,
    MissingPipeModule
  ],
  exports: [MovieSummaryStoryComponent]
})
export class MovieSummaryStorytModule { }
