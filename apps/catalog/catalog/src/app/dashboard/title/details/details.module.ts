import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TitleDetailsComponent } from './details.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MovieSummaryMainModule } from '@blockframes/movie/dashboard/components//summary/main/main.module';
import { MovieSummaryFestivalPrizesModule } from '@blockframes/movie/dashboard/components//summary/festival-prizes/festival-prizes.module';
import { MovieSummarySalesCastModule } from '@blockframes/movie/dashboard/components//summary/sales-cast/sales-cast.module';
import { MovieSummaryCountryModule } from '@blockframes/movie/dashboard/components//summary/country/country.module';
import { MovieSummaryInformationModule } from '@blockframes/movie/dashboard/components/summary/information/information.module';
import { MovieSummaryStoryModule } from '@blockframes/movie/dashboard/components/summary/story/story.module';
import { MovieSummaryCreditModule } from '@blockframes/movie/dashboard/components/summary/credit/credit.module';
import { MovieSummaryImageModule } from '@blockframes/movie/dashboard/components/summary/image/image.module';
import { MovieSummaryBudgetModule } from '@blockframes/movie/dashboard/components/summary/budget/budget.module';
import { MovieSummaryTechnicalInformationModule } from '@blockframes/movie/dashboard/components/summary/technical-information/technical-information.module';
import { MovieSummaryEvaluationModule } from '@blockframes/movie/dashboard/components/summary/evaluation/evaluation.module';
import { MovieSummaryFileModule } from '@blockframes/movie/dashboard/components/summary/file/file.module';



@NgModule({
  declarations: [TitleDetailsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Material
    MatCardModule,
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
