import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsComponent } from './analytics.component';
import { EventFromShellModule } from '@blockframes/event/form/shell/shell.module';
import { EventAnalyticsModule } from '@blockframes/event/components/analytics/analytics.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AnalyticsComponent],
  imports: [
    CommonModule,
    EventFromShellModule,
    EventAnalyticsModule,
    RouterModule.forChild([{ path: '', component: AnalyticsComponent }]),
  ]
})
export class AnalyticsModule { }
