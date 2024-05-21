// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

// Libraries
import { FlexLayoutModule } from '@angular/flex-layout';

// Pages
import { HomeComponent } from './home.component';

// Modules
import { MovieAnalyticsChartModule } from '@blockframes/analytics/components/movie-analytics-chart/movie-analytics-chart.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { NoTitleModule } from '@blockframes/ui/dashboard/components/no-title/no-title.module';
import { AppPipeModule } from '@blockframes/utils/pipes/app.pipe';
import { HasAppStatusModule } from '@blockframes/movie/pipes/has-app-status.pipe';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

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
