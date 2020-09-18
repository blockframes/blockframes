// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Components
import { MovieViewArtisticComponent } from './artistic.component';
import { MovieTunnelSummaryModule } from '@blockframes/movie/form/summary/summary.module';
import { GetPathModule } from '@blockframes/utils/pipes/get-path.pipe';


@NgModule({
  declarations: [MovieViewArtisticComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieTunnelSummaryModule,
    GetPathModule,
    RouterModule.forChild([{ path: '', component: MovieViewArtisticComponent }])
  ],
  exports: [MovieViewArtisticComponent]
})
export class MovieViewArtisticModule { }
