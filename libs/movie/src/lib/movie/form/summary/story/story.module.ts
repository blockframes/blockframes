import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';
import { MovieSummaryStoryComponent } from './story.component';
import { MatChipsModule } from '@angular/material/chips';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';

@NgModule({
  declarations: [MovieSummaryStoryComponent],
  imports: [
    CommonModule,
    MissingPipeModule,
    MatChipsModule,
    MissingControlModule
  ],
  exports: [MovieSummaryStoryComponent]
})
export class MovieSummaryStoryModule { }
