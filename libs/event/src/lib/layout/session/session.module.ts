import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventSessionComponent } from './session.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { EventPlayerModule } from '../../components/player/player.module';
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [EventSessionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    MatProgressSpinnerModule,

    EventTimeModule,
    EventPlayerModule,

    RouterModule.forChild([{ path: '', component: EventSessionComponent }])
  ]
})
export class EventSessionModule { }
