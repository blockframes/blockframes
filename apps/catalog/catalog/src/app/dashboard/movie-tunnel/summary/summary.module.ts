import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { TunnelSummaryComponent } from './summary.component';

// Summary components
import { MovieSummaryMainModule } from '@blockframes/movie/movie/form/summary/main/main.module';
import { MovieSummaryFestivalPrizesModule } from '@blockframes/movie/movie/form/summary/festival-prizes/festival-prizes.module';
import { MovieSummarySalesCastModule } from '@blockframes/movie/movie/form/summary/sales-cast/sales-cast.module';
import { MovieSummaryCountryModule } from '@blockframes/movie/movie/form/summary/country/country.module';
import { MovieSummaryInformationModule } from '@blockframes/movie/movie/form/summary/information/information.module';
import { MovieSummaryStoryModule } from '@blockframes/movie/movie/form/summary/story/story.module';
import { MovieSummaryCreditModule } from '@blockframes/movie/movie/form/summary/credit/credit.module';
import { MovieSummaryBudgetModule } from '@blockframes/movie/movie/form/summary/budget/budget.module';
import { MovieSummaryTechnicalInformationModule } from '@blockframes/movie/movie/form/summary/technical-information/technical-information.module';
import { MovieSummaryImageModule } from '@blockframes/movie/movie/form/summary/image/image.module';
import { MovieSummaryFileModule } from '@blockframes/movie/movie/form/summary/file/file.module';
import { MovieSummaryEvaluationModule } from '@blockframes/movie/movie/form/summary/evaluation/evaluation.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatButtonModule,
    MatSnackBarModule,
    RouterModule.forChild([{ path: '', component: TunnelSummaryComponent }])
  ],
})
export class TunnelSummaryModule {}
