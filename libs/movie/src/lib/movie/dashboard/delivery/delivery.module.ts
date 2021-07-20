// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { MovieViewDeliveryComponent } from './delivery.component';
import { MovieTunnelSummaryModule } from '@blockframes/movie/form/summary/summary.module';
import { GetPathModule } from '@blockframes/utils/pipes/get-path.pipe';
import { MatIconModule } from '@angular/material/icon';
import { FileNameModule } from '@blockframes/utils/pipes';


@NgModule({
  declarations: [MovieViewDeliveryComponent],
  imports: [
    CommonModule,
    MovieTunnelSummaryModule,
    GetPathModule,
    FileNameModule,
    RouterModule.forChild([{ path: '', component: MovieViewDeliveryComponent }]),

    MatIconModule,
  ],
  exports: [MovieViewDeliveryComponent]
})
export class MovieViewDeliveryModule { }
