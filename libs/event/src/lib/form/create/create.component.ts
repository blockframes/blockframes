import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '@blockframes/auth/+state';
import { AccessibilityTypes } from '@blockframes/utils/static-model/types';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { Event, isMeeting } from '../../+state/event.model';
import { EventForm } from '../event.form';

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
    @Inject(MAT_DIALOG_DATA) data: {event: Event, types: string[] },
    public dialogRef: MatDialogRef<EventCreateComponent>,
    private orgQuery: OrganizationQuery,
    private authService: AuthService
  ) {
    this.form = new EventForm(data.event);
    this.types = data.types;
  }

  async createAndRedirect() {
    const event = this.form.value;
    event.ownerOrgId = this.orgQuery.getActiveId();
    if (isMeeting(event)) {
      event.meta.organizerUid = (await this.authService.user).uid;
    }
    if (event.allDay) {
      event.start.setHours(0,0,0);
      event.end.setHours(23,59,59);
    }
    event.accessibility = this.accessibility;
    this.dialogRef.close({ event });
  }

  onTypeSelected(event) {
    switch (event.value) {
      case "meeting":
        this.accessibility = "public";
        break;
      case "screening":
        this.accessibility = 'private';
        break; 
    }
  }
}
