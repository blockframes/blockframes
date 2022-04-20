import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Invitation } from '@blockframes/model';

type Host<type> = type extends 'user' ? Invitation['fromUser'] : Invitation['fromOrg'];

@Pipe({ name: 'host', pure: true })
export class HostPipe implements PipeTransform {
  transform = getHost;
}

/**
 * Get the host of an invitation
 */
export function getHost(invitation: Invitation, hostType: 'user'): Invitation['fromUser']
export function getHost(invitation: Invitation, hostType: 'org'): Invitation['fromOrg']
export function getHost(invitation: Invitation, hostType: 'user' | 'org' = 'org'): Host<typeof hostType> {
  const { fromOrg, fromUser, toOrg, toUser, mode } = invitation;
  if (mode === 'invitation') {
    return hostType === 'org' ? fromOrg : fromUser;
  }
  if (mode === 'request') {
    return hostType === 'org' ? toOrg : toUser;
  }
}


@NgModule({
  declarations: [HostPipe],
  exports: [HostPipe],
})
export class HostPipeModule {}