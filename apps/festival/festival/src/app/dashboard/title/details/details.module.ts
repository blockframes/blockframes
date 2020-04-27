import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TitleDetailsComponent } from './details.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
// TODO #2570
/* import { MatIconModule } from '@angular/material/icon'; */
import { MovieSummaryMainModule } from '@blockframes/movie/form/summary/main/main.module';
import { MovieSummaryFestivalPrizesModule } from '@blockframes/movie/form/summary/festival-prizes/festival-prizes.module';
import { MovieSummarySalesCastModule } from '@blockframes/movie/form/summary/sales-cast/sales-cast.module';
import { MovieSummaryCountryModule } from '@blockframes/movie/form/summary/country/country.module';
import { MovieSummaryInformationModule } from '@blockframes/movie/form/summary/information/information.module';
import { MovieSummaryStoryModule } from '@blockframes/movie/form/summary/story/story.module';
import { MovieSummaryCreditModule } from '@blockframes/movie/form/summary/credit/credit.module';
import { MovieSummaryImageModule } from '@blockframes/movie/form/summary/image/image.module';
import { MovieSummaryBudgetModule } from '@blockframes/movie/form/summary/budget/budget.module';
import { MovieSummaryTechnicalInformationModule } from '@blockframes/movie/form/summary/technical-information/technical-information.module';
import { MovieSummaryEvaluationModule } from '@blockframes/movie/form/summary/evaluation/evaluation.module';
import { MovieSummaryFileModule } from '@blockframes/movie/form/summary/file/file.module';



@NgModule({
  declarations: [TitleDetailsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
    // TODO #2570
/*     MatIconModule, */
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
