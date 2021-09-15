import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsDetailsComponent } from './analytics-details.component';
import { EventEditModule as LayoutEventEditModule } from '@blockframes/event/layout/edit/edit.module';

// Material
import { EventAnalyticsModule } from '@blockframes/event/components/analytics/analytics.module';

@NgModule({
  declarations: [AnalyticsDetailsComponent],
  imports: [
    CommonModule,
    LayoutEventEditModule,
    EventAnalyticsModule,
  ]
})
export class AnalyticsDetailsModule { }
