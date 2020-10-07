// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Components
import { MovieViewAdditionalComponent } from './additional.component';
import { MovieTunnelSummaryModule } from '@blockframes/movie/form/summary/summary.module';
import { GetPathModule } from '@blockframes/utils/pipes/get-path.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { HasStatusModule } from '@blockframes/movie/pipes/has-status.pipe';


@NgModule({
  declarations: [MovieViewAdditionalComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieTunnelSummaryModule,
    GetPathModule,
    MatDividerModule,
    HasStatusModule,
    RouterModule.forChild([{ path: '', component: MovieViewAdditionalComponent }])
  ],
  exports: [MovieViewAdditionalComponent]
})
export class MovieViewAdditionalModule { }
