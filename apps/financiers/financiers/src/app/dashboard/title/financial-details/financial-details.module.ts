// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Components
import { MovieViewFinancialDetailComponent } from './financial-details.component';
import { MovieTunnelSummaryModule } from '@blockframes/movie/form/summary/summary.module';
import { GetPathModule } from '@blockframes/utils/pipes/get-path.pipe';
import { HasStatusModule } from '@blockframes/movie/pipes/has-status.pipe';
import { SummaryFinancialDetailsModule } from '../../tunnel/summary/financial-details/financial-details.module';

// Material
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [MovieViewFinancialDetailComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieTunnelSummaryModule,
    MatDividerModule,
    GetPathModule,
    HasStatusModule,
    SummaryFinancialDetailsModule,
    RouterModule.forChild([{ path: '', component: MovieViewFinancialDetailComponent }])
  ],
  exports: [MovieViewFinancialDetailComponent]
})
export class MovieViewFinancialDetailModule { }
