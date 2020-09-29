// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Components
import { MovieViewMainComponent } from './main.component';
import { MovieTunnelSummaryModule } from '@blockframes/movie/form/summary/summary.module';
import { GetPathModule } from '@blockframes/utils/pipes/get-path.pipe';
import { HasStatusModule } from '@blockframes/movie/pipes/has-status.pipe';

// Material
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [MovieViewMainComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieTunnelSummaryModule,
    MatDividerModule,
    GetPathModule,
    HasStatusModule,
    RouterModule.forChild([{ path: '', component: MovieViewMainComponent }])
  ],
  exports: [MovieViewMainComponent]
})
export class MovieViewMainModule { }
