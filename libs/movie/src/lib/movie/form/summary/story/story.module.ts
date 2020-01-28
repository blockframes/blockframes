import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';
import { MovieSummaryStoryComponent } from './story.component';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [MovieSummaryStoryComponent],
  imports: [
    CommonModule,
    MissingPipeModule,
    MatChipsModule
  ],
  exports: [MovieSummaryStoryComponent]
})
export class MovieSummaryStoryModule { }
