import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { CalendarEvent } from 'angular-calendar';
import { AuthQuery } from '@blockframes/auth/+state';
import { EventForm } from '../event.form';

@Component({
  selector: 'event-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCreateComponent {

  form = new EventForm();
  
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public event: CalendarEvent,
    private bottomSheetRef: MatBottomSheetRef<EventCreateComponent>,
    private authQuery: AuthQuery
  ) {
    this.form.patchValue(event);
  }

  create() {
    const event = {
      ...this.form.value,
      userId: this.authQuery.userId,
      draggable: true,
      resizable: {
        beforeStart: true, // this allows you to configure the sides the event is resizable from
        afterEnd: true
      }
    };
    this.bottomSheetRef.dismiss(event);
  }

  cancel(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
