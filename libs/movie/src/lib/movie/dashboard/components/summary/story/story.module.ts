import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSummaryStoryComponent } from './story.component';
import { MatChipsModule } from '@angular/material/chips';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MovieSummaryStoryComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatChipsModule,
    MissingControlModule
  ],
  exports: [MovieSummaryStoryComponent]
})
export class MovieSummaryStoryModule { }
