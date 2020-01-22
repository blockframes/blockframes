import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
// Materials
import { TunnelSummaryComponent } from './summary.component';
import { MovieSummaryMainModule } from '@blockframes/movie/movieform/summary/main/main.module';
import { MatCardModule } from '@angular/material/card';
import { MovieSummaryFestivalPrizesModule } from '@blockframes/movie/movieform/summary/festival-prizes/festival-prizes.module';
import { MovieSummarySalesCastModule } from '@blockframes/movie/movieform/summary/sales-cast/sales-cast.module';
import { MovieSummaryCountryModule } from '@blockframes/movie/movieform/summary/country/country.module';

@NgModule({
  declarations: [TunnelSummaryComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,
    MovieSummaryMainModule,
    MovieSummaryFestivalPrizesModule,
    MovieSummarySalesCastModule,
    MovieSummaryCountryModule,
    MatCardModule,
    RouterModule.forChild([{ path: '', component: TunnelSummaryComponent }])
  ],
})
export class TunnelSummaryModule {}
