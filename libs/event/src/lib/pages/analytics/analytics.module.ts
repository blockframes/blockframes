import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsComponent } from './analytics.component';
import { EventEditModule as LayoutEventEditModule } from '@blockframes/event/layout/edit/edit.module';

// Material
import { EventAnalyticsModule } from '@blockframes/event/components/analytics/analytics.module';

@NgModule({
  declarations: [AnalyticsComponent],
  imports: [
    CommonModule,
    LayoutEventEditModule,
    EventAnalyticsModule,
  ]
})
export class AnalyticsModule { }
