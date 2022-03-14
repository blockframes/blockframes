import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Invitation } from '@blockframes/model';

type Guest<type> = type extends 'user' ? Invitation['toUser'] : Invitation['toOrg'];

@Pipe({ name: 'guest', pure: true })
export class GuestPipe implements PipeTransform {
  transform = getGuest;
}

/**
 * Get the guest of an invitation
 */
export function getGuest(invitation: Invitation, guestType: 'user'): Invitation['toUser']
export function getGuest(invitation: Invitation, guestType: 'org'): Invitation['toOrg']
export function getGuest(invitation: Invitation, guestType: 'user' | 'org' = 'user'): Guest<typeof guestType> {
  const { fromOrg, fromUser, toOrg, toUser, mode } = invitation;
  if (mode === 'invitation') {
    return guestType === 'user' ? toUser : toOrg;
  }
  if (mode === 'request') {
    return guestType === 'user' ? fromUser : fromOrg;
  }
}


@NgModule({
  declarations: [GuestPipe],
  exports: [GuestPipe],
})
export class GuestPipeModule {}