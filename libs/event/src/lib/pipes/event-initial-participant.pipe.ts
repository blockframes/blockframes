import {NgModule, Pipe, PipeTransform} from '@angular/core';
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

@Pipe({
  name: 'eventInitials'
})
export class EventInitialsPipe implements PipeTransform {

  /**
   * Get initials from participant
   * @param participant
   */
  transform(participant: IParticipantMeeting): string {
    return `${participant.festivalData.firstName.charAt(0).toUpperCase()}${participant.festivalData.lastName.charAt(0).toUpperCase()}`
  }
}

@NgModule({
  declarations: [EventInitialsPipe],
  exports: [EventInitialsPipe],
})
export class EventInitialsModule {}
