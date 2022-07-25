// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// Pages
import { HomeComponent } from './home.component';

// Modules
import { CarouselModule } from '@blockframes/ui/carousel/carousel.module';
import { PieChartModule } from '@blockframes/analytics/components/pie-chart/pie-chart.module';
import { AnalyticsMapModule } from '@blockframes/analytics/components/map/map.module';
import { LineChartModule } from '@blockframes/analytics/components/line-chart/line-chart.module';
import { AppPipeModule } from '@blockframes/utils/pipes/app.pipe';
import { NoTitleModule } from '@blockframes/ui/dashboard/components/no-title/no-title.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { HasAppStatusModule } from '@blockframes/movie/pipes/has-app-status.pipe';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { MapModule } from '@blockframes/ui/map';
import { DisplayNameModule, MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { LogoSpinnerModule } from '@blockframes/ui/rive/logo-spinner.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    CarouselModule,
    PieChartModule,
    AnalyticsMapModule,
    LineChartModule,
    AppPipeModule,
    NoTitleModule,
    ImageModule,
    HasAppStatusModule,
    MapModule,
    DisplayNameModule,
    ToLabelModule,
    TableModule,
    MaxLengthModule,
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
