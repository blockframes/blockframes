import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthQuery } from '@blockframes/auth/+state';
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
    private authQuery: AuthQuery
  ) {
    this.form = new EventForm(event);
  }

  /**
   * @param redirect If true should redirect to the event page
   */
  createAndRedirect(redirect: boolean) {
    const userId = this.authQuery.userId;
    const event = { ...this.form.value, userId };
    this.dialogRef.close({ event, redirect });
  }
}
