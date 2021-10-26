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

// Angular
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [AnalyticsComponent],
  imports: [
    CommonModule,
    ImageModule,
    TableModule,
    FlexLayoutModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    ToLabelModule,
    DurationModule,
    MatProgressSpinnerModule,
    EventFromShellModule,
    RouterModule.forChild([{ path: '', component: AnalyticsComponent }]),
  ]
})
export class AnalyticsModule { }
