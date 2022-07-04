import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsComponent } from './analytics.component';
import { EventFromShellModule } from '@blockframes/event/form/shell/shell.module';
import { RouterModule } from '@angular/router';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { IsWatchingNowPipeModule } from '@blockframes/event/pipes/is-watching-now.pipe';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { OngoingButtonModule } from '@blockframes/ui/ongoing-button/ongoing-button.module';
import { MetricCardListModule } from '@blockframes/analytics/components/metric-card-list/metric-card-list.module';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [AnalyticsComponent],
  imports: [
    CommonModule,
    ImageModule,
    TableModule,
    FlexLayoutModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    ToLabelModule,
    DurationModule,
    MatProgressSpinnerModule,
    EventFromShellModule,
    IsWatchingNowPipeModule,
    MetricCardListModule,
    OngoingButtonModule,
    TagModule,
    RouterModule.forChild([{ path: '', component: AnalyticsComponent }]),
  ]
})
export class AnalyticsModule { }
