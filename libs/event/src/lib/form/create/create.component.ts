import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { Event } from '../../+state/event.model';
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

  constructor(
    @Inject(MAT_DIALOG_DATA) data: {event: Event, types: string[] },
    public dialogRef: MatDialogRef<EventCreateComponent>,
    private orgQuery: OrganizationQuery
  ) {
    this.form = new EventForm(data.event);
    this.types = data.types;
  }

  /**
   * @param redirect If true should redirect to the event page
   */
  createAndRedirect(redirect: boolean) {
    const event = this.form.value;
    event.ownerId = this.orgQuery.getActiveId();
    if (event.allDay) {
      event.start.setHours(0,0,0);
      event.end.setHours(23,59,59);
    }
    this.dialogRef.close({ event, redirect });
  }
}
