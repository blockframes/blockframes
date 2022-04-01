// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Libraries
import { FlexLayoutModule } from '@angular/flex-layout';

// Pages
import { HomeComponent } from './home.component';

// Modules
import { CarouselModule } from '@blockframes/ui/carousel/carousel.module';
import { PieChartModule } from '@blockframes/analytics/components/pie-chart/pie-chart.module';
import { AnalyticsMapModule } from '@blockframes/analytics/components/map/map.module';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { AppPipeModule } from '@blockframes/utils/pipes/app.pipe';
import { NoTitleModule } from '@blockframes/ui/dashboard/components/no-title/no-title.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { HasAppStatusModule } from '@blockframes/movie/pipes/has-app-status.pipe';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    CarouselModule,
    PieChartModule,
    AnalyticsMapModule,
    MatLayoutModule,
    AppPipeModule,
    NoTitleModule,
    ImageModule,
    HasAppStatusModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,

    // Routing
    RouterModule.forChild([{ path: '', component: HomeComponent }])
  ]
})
export class HomeModule { }
