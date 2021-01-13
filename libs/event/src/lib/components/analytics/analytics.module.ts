import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventAnalyticsComponent } from './analytics.component';

import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [EventAnalyticsComponent],
  imports: [
    CommonModule,
    ImageModule,
    TableFilterModule,
    FlexLayoutModule,
    MatCardModule,
    MatIconModule,
    ToLabelModule,
    MatProgressSpinnerModule,
  ],
  exports: [EventAnalyticsComponent]
})
export class EventAnalyticsModule { }
