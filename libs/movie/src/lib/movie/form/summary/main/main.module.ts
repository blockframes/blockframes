import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { TranslateObjectModule } from '@blockframes/utils/pipes/translate-object.module';

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
    TranslateObjectModule,
  ],
  exports: [MovieSummaryMainComponent]
})
export class MovieSummaryMainModule { }
