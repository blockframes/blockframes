import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '@blockframes/auth/+state';
import { AccessibilityTypes } from '@blockframes/utils/static-model/types';
import { OrganizationService } from '@blockframes/organization/+state';
import { EventForm } from '../event.form';
import { Event, Meeting, Screening, Slate } from '@blockframes/model';

@Component({
  selector: 'event-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCreateComponent {
  types: string[];
  form: EventForm;
  accessibility: AccessibilityTypes;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { event: Event, types: string[] },
    public dialogRef: MatDialogRef<EventCreateComponent>,
    private orgService: OrganizationService,
    private authService: AuthService
  ) {
    this.form = new EventForm(data.event);
    this.types = data.types;
  }

  async createAndRedirect() {
    const event = this.form.value as Event<Meeting | Screening | Slate>;
    event.ownerOrgId = this.orgService.org.id;
    event.meta.organizerUid = (await this.authService.user).uid;
    if (event.allDay) {
      event.start.setHours(0, 0, 0);
      event.end.setHours(23, 59, 59);
    }
    event.accessibility = this.accessibility;
    this.dialogRef.close({ event });
  }

  onTypeSelected(event) {
    this.accessibility = event.value === 'meeting' ? 'public' : 'private';
  }
}
