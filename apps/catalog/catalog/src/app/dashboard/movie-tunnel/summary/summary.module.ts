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
import { MovieSummaryInformationModule } from '@blockframes/movie/movieform/summary/information/information.module';
import { MovieSummaryStoryModule } from '@blockframes/movie/movieform/summary/story/story.module';
import { MatIconModule } from '@angular/material/icon';
import { MovieSummaryCreditModule } from '@blockframes/movie/movieform/summary/credit/credit.module';
import { MovieSummaryBudgetModule } from '@blockframes/movie/movieform/summary/budget/budget.module';
import { MovieSummaryTechnicalInformationModule } from '@blockframes/movie/movieform/summary/technical-information/technical-information.module';
import { MovieSummaryImageModule } from '@blockframes/movie/movieform/summary/image/image.module';
import { MovieSummaryFileModule } from '@blockframes/movie/movieform/summary/file/file.module';
import { MovieSummaryEvaluationModule } from '@blockframes/movie/movieform/summary/evaluation/evaluation.module';

@NgModule({
  declarations: [TunnelSummaryComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,
    // Summary components
    MovieSummaryMainModule,
    MovieSummaryFestivalPrizesModule,
    MovieSummarySalesCastModule,
    MovieSummaryCountryModule,
    MovieSummaryInformationModule,
    MovieSummaryStoryModule,
    MovieSummaryCreditModule,
    MovieSummaryBudgetModule,
    MovieSummaryTechnicalInformationModule,
    MovieSummaryImageModule,
    MovieSummaryFileModule,
    MovieSummaryEvaluationModule,
    // Materials
    MatCardModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: TunnelSummaryComponent }])
  ],
})
export class TunnelSummaryModule {}
