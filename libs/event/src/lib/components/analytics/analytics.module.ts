import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventAnalyticsComponent } from './analytics.component';

import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [EventAnalyticsComponent],
  imports: [
    CommonModule,
    ImageReferenceModule,
    TableFilterModule,
    FlexLayoutModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  exports: [EventAnalyticsComponent]
})
export class EventAnalyticsModule { }
