import {NgModule, Pipe, PipeTransform} from '@angular/core';

import {EventLinkPipe} from "@blockframes/event/pipes/event-link.pipe";
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

@Pipe({
  name: 'eventInitialParticipant'
})
export class EventInitialParticipantPipe implements PipeTransform {

  transform(participant: IParticipantMeeting): string {
    return `${participant.festivalData.firstName.charAt(0).toUpperCase()}${participant.festivalData.lastName.charAt(0).toUpperCase()}`
  }

}

@NgModule({
  declarations: [EventInitialParticipantPipe],
  exports: [EventInitialParticipantPipe],
})
export class EventInitialParticipantModule {}
