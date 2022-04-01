import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invitation, InvitationStatus } from '@blockframes/shared/model';

/** Return the right icon name depending on the status */
@Pipe({ name: 'statusIcon', pure: true })
export class StatusIconPipe implements PipeTransform {
  transform(status: InvitationStatus): 'check_circle' | 'close' | 'access_time' {
    switch (status) {
      case 'accepted':
        return 'check_circle';
      case 'declined':
        return 'close';
      case 'pending':
        return 'access_time';
    }
  }
}

@Pipe({ name: 'statusColor', pure: true })
export class StatusColorPipe implements PipeTransform {
  transform(status: InvitationStatus): 'primary' | 'warn' | '' {
    switch (status) {
      case 'accepted':
        return 'primary';
      case 'declined':
        return 'warn';
      case 'pending':
        return '';
    }
  }
}

@Pipe({ name: 'statusLength', pure: true })
export class StatusLengthPipe implements PipeTransform {
  transform(list: Invitation[], status: InvitationStatus): number {
    return (list || []).filter(invitation => invitation.status === status).length;
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [StatusIconPipe, StatusColorPipe, StatusLengthPipe],
  exports: [StatusIconPipe, StatusColorPipe, StatusLengthPipe],
})
export class StatusModule {}
