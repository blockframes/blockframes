import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CalendarEvent } from 'angular-calendar';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventEditComponent {

  form = new FormGroup({
    id: new FormControl(),
    title: new FormControl(),
    start: new FormControl(),
    end: new FormControl(),
    allDay: new FormControl(false)
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public event: CalendarEvent,
    public dialogRef: MatDialogRef<EventEditComponent>,
  ) {
    this.form.patchValue(event);
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

  remove() {
    console.log(this.event);
  }
}
