import { Pipe, PipeTransform, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Invitation } from "../+state/invitation.model";

@Pipe({ name: 'eventLink', pure: true })
export class EventLinkPipe implements PipeTransform {

  transform(invitation: Invitation): string[] {
    return invitation.type === 'joinOrganization' ? ['../../organization', invitation.toOrg.id, 'view', 'members'] : ['/event/', invitation.eventId, 'r', 'i'];
  }
}


@NgModule({
  imports: [CommonModule],
  declarations: [EventLinkPipe],
  exports: [EventLinkPipe],
})
export class EventLinkModule { }
