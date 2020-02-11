import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TitleDetailsComponent } from './details.component';
import { MatCardModule, MatIconModule, MatButtonModule } from '@angular/material';
import { MovieSummaryMainModule } from '@blockframes/movie/movie/form/summary/main/main.module';
import { MovieSummaryFestivalPrizesModule } from '@blockframes/movie/movie/form/summary/festival-prizes/festival-prizes.module';
import { MovieSummarySalesCastModule } from '@blockframes/movie/movie/form/summary/sales-cast/sales-cast.module';
import { MovieSummaryCountryModule } from '@blockframes/movie/movie/form/summary/country/country.module';
import { MovieSummaryInformationModule } from '@blockframes/movie/movie/form/summary/information/information.module';
import { MovieSummaryStoryModule } from '@blockframes/movie/movie/form/summary/story/story.module';
import { MovieSummaryCreditModule } from '@blockframes/movie/movie/form/summary/credit/credit.module';
import { MovieSummaryImageModule } from '@blockframes/movie/movie/form/summary/image/image.module';
import { MovieSummaryBudgetModule } from '@blockframes/movie/movie/form/summary/budget/budget.module';
import { MovieSummaryTechnicalInformationModule } from '@blockframes/movie/movie/form/summary/technical-information/technical-information.module';
import { MovieSummaryEvaluationModule } from '@blockframes/movie/movie/form/summary/evaluation/evaluation.module';
import { MovieSummaryFileModule } from '@blockframes/movie/movie/form/summary/file/file.module';



@NgModule({
  declarations: [TitleDetailsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
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
    RouterModule.forChild([{ path: '', component: TitleDetailsComponent }])
  ]
})
export class TitleDetailsModule { }
