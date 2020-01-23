import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieSummaryMainComponent } from './main.component';

import { MissingPipeModule } from '@blockframes/utils';

@NgModule({
  declarations: [MovieSummaryMainComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MissingPipeModule,
  ],
  exports: [MovieSummaryMainComponent]
})
export class MovieSummaryMainModule { }
