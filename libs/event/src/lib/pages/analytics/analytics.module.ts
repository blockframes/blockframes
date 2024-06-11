import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Component
import { AnalyticsComponent } from './analytics.component';
import { EventFromShellModule } from '../../form/shell/shell.module';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { IsWatchingNowPipeModule } from '../../pipes/is-watching-now.pipe';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { OngoingButtonModule } from '@blockframes/ui/ongoing-button/ongoing-button.module';
import { MetricCardListModule } from '@blockframes/analytics/components/metric-card-list/metric-card-list.module';
import { EventTimeModule } from '../../pipes/event-time.pipe';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
