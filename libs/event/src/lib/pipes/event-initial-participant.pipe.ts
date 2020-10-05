import {NgModule, Pipe, PipeTransform} from '@angular/core';

import { Participant } from 'twilio-video';
import {EventLinkPipe} from "@blockframes/event/pipes/event-link.pipe";

@Pipe({
  name: 'eventInitialParticipant'
})
export class EventInitialParticipantPipe implements PipeTransform {

  transform(participant: Participant): string {
    return `${participant.firstName.charAt(0).toUpperCase()}${participant.lastName.charAt(0).toUpperCase()}`
  }

}

@NgModule({
  declarations: [EventInitialParticipantPipe],
  exports: [EventInitialParticipantPipe],
})
export class EventInitialParticipantModule {}
