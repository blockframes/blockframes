import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { TunnelSummaryComponent } from './summary.component';

// Summary components
import { MovieSummaryMainModule } from '@blockframes/movie/dashboard/components/summary/main/main.module';
import { MovieSummaryFestivalPrizesModule } from '@blockframes/movie/dashboard/components/summary/festival-prizes/festival-prizes.module';
import { MovieSummarySalesCastModule } from '@blockframes/movie/dashboard/components/summary/sales-cast/sales-cast.module';
import { MovieSummaryCountryModule } from '@blockframes/movie/dashboard/components/summary/country/country.module';
import { MovieSummaryInformationModule } from '@blockframes/movie/dashboard/components//summary/information/information.module';
import { MovieSummaryStoryModule } from '@blockframes/movie/dashboard/components/summary/story/story.module';
import { MovieSummaryCreditModule } from '@blockframes/movie/dashboard/components/summary/credit/credit.module';
import { MovieSummaryBudgetModule } from '@blockframes/movie/dashboard/components/summary/budget/budget.module';
import { MovieSummaryTechnicalInformationModule } from '@blockframes/movie/dashboard/components/summary/technical-information/technical-information.module';
import { MovieSummaryImageModule } from '@blockframes/movie/dashboard/components/summary/image/image.module';
import { MovieSummaryFileModule } from '@blockframes/movie/dashboard/components/summary/file/file.module';
import { MovieSummaryEvaluationModule } from '@blockframes/movie/dashboard/components/summary/evaluation/evaluation.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [TunnelSummaryComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,

    // Materials
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: TunnelSummaryComponent }])
  ],
})
export class TunnelSummaryModule { }
