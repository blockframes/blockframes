import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthQuery } from '@blockframes/auth/+state';
import { OrganizationQuery } from '@blockframes/organization/organization/+state';
import { Event } from '../../+state/event.model';
import { EventForm } from '../event.form';

@Component({
  selector: 'event-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCreateComponent {

  form: EventForm;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) event: Event,
    public dialogRef: MatDialogRef<EventCreateComponent>,
    private authQuery: AuthQuery,
    private orgQuery: OrganizationQuery
  ) {
    this.form = new EventForm(event);
  }

  /**
   * @param redirect If true should redirect to the event page
   */
  createAndRedirect(redirect: boolean) {
    const event = this.form.value;
    if (this.form.value.type === 'screening') {
      event.ownerId = this.orgQuery.getActiveId();
    } else {
      event.ownerId = this.authQuery.userId;
    }
    this.dialogRef.close({ event, redirect });
  }
}
