import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieFormSummaryComponent } from './summary.component';

// Summary components
import { MovieSummaryMainModule } from '@blockframes/movie/form/summary/main/main.module';
import { MovieSummaryFestivalPrizesModule } from '@blockframes/movie/form/summary/festival-prizes/festival-prizes.module';
import { MovieSummarySalesCastModule } from '@blockframes/movie/form/summary/sales-cast/sales-cast.module';
import { MovieSummaryCountryModule } from '@blockframes/movie/form/summary/country/country.module';
import { MovieSummaryInformationModule } from '@blockframes/movie/form/summary/information/information.module';
import { MovieSummaryStoryModule } from '@blockframes/movie/form/summary/story/story.module';
import { MovieSummaryCreditModule } from '@blockframes/movie/form/summary/credit/credit.module';
import { MovieSummaryBudgetModule } from '@blockframes/movie/form/summary/budget/budget.module';
import { MovieSummaryTechnicalInformationModule } from '@blockframes/movie/form/summary/technical-information/technical-information.module';
import { MovieSummaryImageModule } from '@blockframes/movie/form/summary/image/image.module';
import { MovieSummaryFileModule } from '@blockframes/movie/form/summary/file/file.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [MovieFormSummaryComponent],
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
    // Materials
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterModule.forChild([{ path: '', component: MovieFormSummaryComponent }])
  ],
})
export class TunnelSummaryModule {}
