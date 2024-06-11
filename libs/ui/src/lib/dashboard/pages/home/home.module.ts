// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// Libraries
import { FlexLayoutModule } from '@angular/flex-layout';

// Pages
import { HomeComponent } from './home.component';

// Modules
import { MovieAnalyticsChartModule } from '@blockframes/analytics/components/movie-analytics-chart/movie-analytics-chart.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { NoTitleModule } from '../../../dashboard/components/no-title/no-title.module';
import { AppPipeModule } from '@blockframes/utils/pipes/app.pipe';
import { HasAppStatusModule } from '@blockframes/movie/pipes/has-app-status.pipe';
import { LogoSpinnerModule } from '../../../logo-spinner/logo-spinner.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieAnalyticsChartModule,
    ImageModule,
    NoTitleModule,
    AppPipeModule,
    HasAppStatusModule,
    LogoSpinnerModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,

    // Routing
    RouterModule.forChild([{ path: '', component: HomeComponent }])
  ]
})
export class HomeModule { }
