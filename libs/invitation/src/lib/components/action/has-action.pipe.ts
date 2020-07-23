import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from "@angular/core";
import { AuthQuery } from "@blockframes/auth/+state/auth.query";
import { Invitation } from "@blockframes/invitation/+state/invitation.model";

@Pipe({ name: 'hasAction', pure: true })
export class InvitationHasActionPipe implements PipeTransform {
  constructor(private authQuery: AuthQuery) {}
  transform(invitation: Invitation) {
    const userId = this.authQuery.userId;
    const isNotFromUser = !(invitation.fromUser?.uid === userId);
    const isToOrg = invitation.toOrg?.id === this.authQuery.orgId;
    const isToUser = invitation.toUser?.uid === userId;
    return invitation.status === 'pending' && ((isNotFromUser && isToOrg) || isToUser);
  }
}

@NgModule({
  exports: [InvitationHasActionPipe],
  declarations: [InvitationHasActionPipe],
})
export class InvitationHasActionPipeModule { }
