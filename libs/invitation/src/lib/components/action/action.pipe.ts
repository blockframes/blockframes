import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '@blockframes/auth/service';
import { Invitation, preferredLanguage, toLabel } from '@blockframes/model';

@Pipe({ name: 'hasAction', pure: true })
export class InvitationHasActionPipe implements PipeTransform {
  constructor(private authService: AuthService) { }
  transform(invitation: Invitation) {
    const userId = this.authService.uid;
    const isNotFromUser = !(invitation.fromUser?.uid === userId);
    const isToOrg = invitation.toOrg?.id && invitation.toOrg.id === this.authService.profile?.orgId;
    const isToUser = invitation.toUser && (invitation.toUser?.uid === userId || invitation.toUser.email === this.authService.anonymousCredentials?.email);
    return invitation.status === 'pending' && ((isNotFromUser && isToOrg) || isToUser);
  }
}

@Pipe({ name: 'invitationStatus', pure: true })
export class InvitationStatusPipe implements PipeTransform {
  transform(invitation: Invitation, small: boolean, i18n?: boolean) {
    const lang = i18n ? preferredLanguage() : undefined;
    const status = toLabel(invitation.status, 'invitationStatus', undefined, undefined, lang);
    if (small) return status;
    const prefix = invitation.fromOrg ? 'Invitation' : 'Request';
    return `${prefix} ${status}`;
  }
}

@NgModule({
  exports: [InvitationHasActionPipe, InvitationStatusPipe],
  declarations: [InvitationHasActionPipe, InvitationStatusPipe],
})
export class InvitationActionPipeModule { }
