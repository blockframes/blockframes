import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { ToLabelModule } from '@blockframes/utils/pipes';

// Components
import { MovieSummaryMainComponent } from './main.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MovieSummaryMainComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    MissingControlModule,
    ToLabelModule,
  ],
  exports: [MovieSummaryMainComponent]
})
export class MovieSummaryMainModule { }
