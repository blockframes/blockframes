// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieViewMainComponent } from './main.component';
import { MovieTunnelSummaryModule } from '@blockframes/movie/form/summary/summary.module';

// Material
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [MovieViewMainComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieTunnelSummaryModule,
    MatDividerModule,
  ],
  exports: [MovieViewMainComponent]
})
export class MovieViewMainModule { }
