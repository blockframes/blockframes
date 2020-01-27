import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieSummaryMainComponent } from './main.component';

import { MissingPipeModule, MissingSlugPipeModule } from '@blockframes/utils';

@NgModule({
  declarations: [MovieSummaryMainComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MissingPipeModule,
    MissingSlugPipeModule
  ],
  exports: [MovieSummaryMainComponent]
})
export class MovieSummaryMainModule { }
