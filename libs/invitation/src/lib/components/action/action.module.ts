import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionComponent } from './action.component';
import { InvitationActionPipeModule } from './action.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe'
import { TagModule } from '@blockframes/ui/tag/tag.module';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ActionComponent],
  exports: [ActionComponent],
  imports: [
    CommonModule,
    EventTimeModule,
    FlexLayoutModule,
    InvitationActionPipeModule,
    TagModule,

    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class InvitationActionModule { }
