import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Component
import { AnalyticsComponent } from './analytics.component';
import { EventFromShellModule } from '@blockframes/event/form/shell/shell.module';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { IsWatchingNowPipeModule } from '@blockframes/event/pipes/is-watching-now.pipe';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { OngoingButtonModule } from '@blockframes/ui/ongoing-button/ongoing-button.module';
import { MetricCardListModule } from '@blockframes/analytics/components/metric-card-list/metric-card-list.module';
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [AnalyticsComponent],
  imports: [
    CommonModule,
    ImageModule,
    TableModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    ToLabelModule,
    DurationModule,
    EventFromShellModule,
    IsWatchingNowPipeModule,
    MetricCardListModule,
    OngoingButtonModule,
    EventTimeModule,
    TagModule,
    LogoSpinnerModule,
    RouterModule.forChild([{ path: '', component: AnalyticsComponent }]),
  ]
})
export class AnalyticsModule { }
