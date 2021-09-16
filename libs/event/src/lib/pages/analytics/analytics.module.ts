import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsComponent } from './analytics.component';
import { EventFromShellModule } from '@blockframes/event/form/shell/shell.module';

// Material
import { EventAnalyticsModule } from '@blockframes/event/components/analytics/analytics.module';

@NgModule({
  declarations: [AnalyticsComponent],
  imports: [
    CommonModule,
    EventFromShellModule,
    EventAnalyticsModule,
  ]
})
export class AnalyticsModule { }
