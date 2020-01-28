import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TitleDetailsComponent } from './details.component';
import { MatCardModule, MatIconModule, MatButtonModule } from '@angular/material';
import { MovieSummaryMainModule } from '@blockframes/movie/movieform/summary/main/main.module';
import { MovieSummaryFestivalPrizesModule } from '@blockframes/movie/movieform/summary/festival-prizes/festival-prizes.module';
import { MovieSummarySalesCastModule } from '@blockframes/movie/movieform/summary/sales-cast/sales-cast.module';
import { MovieSummaryCountryModule } from '@blockframes/movie/movieform/summary/country/country.module';
import { MovieSummaryInformationModule } from '@blockframes/movie/movieform/summary/information/information.module';
import { MovieSummaryStoryModule } from '@blockframes/movie/movieform/summary/story/story.module';
import { MovieSummaryCreditModule } from '@blockframes/movie/movieform/summary/credit/credit.module';
import { MovieSummaryImageModule } from '@blockframes/movie/movieform/summary/image/image.module';
import { MovieSummaryBudgetModule } from '@blockframes/movie/movieform/summary/budget/budget.module';
import { MovieSummaryTechnicalInformationModule } from '@blockframes/movie/movieform/summary/technical-information/technical-information.module';
import { MovieSummaryEvaluationModule } from '@blockframes/movie/movieform/summary/evaluation/evaluation.module';
import { MovieSummaryFileModule } from '@blockframes/movie/movieform/summary/file/file.module';



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
