import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionComponent } from './action.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InvitationActionPipeModule } from './action.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe'
import { TagModule } from '@blockframes/ui/tag/tag.module';

@NgModule({
  declarations: [ActionComponent],
  exports: [ActionComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    EventTimeModule,
    FlexLayoutModule,
    InvitationActionPipeModule,
    TagModule
  ]
})
export class InvitationActionModule { }
