import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieSummaryMainComponent } from './main.component';

// Material
import { MatButtonModule, MatCardModule, MatIconModule } from '@angular/material';
import { MissingPipeModule } from '@blockframes/utils';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MovieSummaryMainComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MissingPipeModule,

    // Material
    MatButtonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  exports: [MovieSummaryMainComponent]
})
export class MovieSummaryMainModule { }
