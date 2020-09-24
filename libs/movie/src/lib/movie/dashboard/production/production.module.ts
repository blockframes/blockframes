// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Components
import { MovieViewProductionComponent } from './production.component';
import { MovieTunnelSummaryModule } from '@blockframes/movie/form/summary/summary.module';
import { GetPathModule } from '@blockframes/utils/pipes/get-path.pipe';


@NgModule({
  declarations: [MovieViewProductionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieTunnelSummaryModule,
    GetPathModule,
    RouterModule.forChild([{ path: '', component: MovieViewProductionComponent }])
  ],
  exports: [MovieViewProductionComponent]
})
export class MovieViewProductionModule { }
