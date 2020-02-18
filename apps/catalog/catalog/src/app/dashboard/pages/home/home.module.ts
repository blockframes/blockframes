// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


// Libraries
import { FlexLayoutModule } from '@angular/flex-layout';

// Pages
import { HomeComponent } from './home.component';

// Modules
import { MovieCreateModule } from '@blockframes/movie/movie/components/movie-create/movie-create.module';
import { MovieCardModule } from '@blockframes/ui/movie-card/movie-card.module';
import { MovieAnalyticsChartModule } from '@blockframes/movie/movie/components/movie-analytics-chart/movie-analytics-chart.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieCardModule,
    MovieCreateModule,
    MovieAnalyticsChartModule,
    // Material
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatProgressSpinnerModule,
    // Routing
    RouterModule.forChild([{ path: '', component: HomeComponent }])
  ]
})
export class HomeModule { }
