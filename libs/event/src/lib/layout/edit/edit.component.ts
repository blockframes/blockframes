import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventForm } from '../../form/event.form';
import { EventService } from '../../+state/event.service';
import { Invitation }  from '@blockframes/invitation/+state/invitation.model';
import { createAlgoliaUserForm } from '@blockframes/utils/algolia';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';

@Component({
  selector: 'event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default  // required for changes on "pristine" for the save button
})
export class EventEditComponent implements OnInit {

  @Input() form = new EventForm();
  @Input() invitations: Invitation[] = [];
  invitationForm = createAlgoliaUserForm();
  progress: Observable<number>;
  sending = new BehaviorSubject(false);
  eventLink: string;

  private duration: number;

  constructor(
    private service: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    const type = this.form.value.type === 'meeting' ? 'lobby' : 'session';
    this.eventLink = `/c/o/marketplace/event/${this.form.value.id}/${type}`;

    const { start, end } = this.form.value;
    this.duration = end.getTime() - start.getTime();
  }

  get meta() {
    return this.form.get('meta');
  }

  save() {
    if (this.form.valid && this.form.dirty) {
      const value = this.form.value;
      if (this.form.value.allDay) {
        value.start.setHours(0,0,0);
        value.end.setHours(23,59,59);
      }
      this.service.update(value);
      this.form.markAsPristine();
    }
  }

  async remove() {
    this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Are you sure you want to delete this event ?',
        question: 'All of the invitations and requests associated to it will be deleted.',
        buttonName: 'Delete',
        onConfirm: () => {
          this.service.remove(this.form.value.id);
          this.router.navigate(['../..'], { relativeTo: this.route })
        }
      }
    })
  }

  onEventChange(key: 'start' | 'end') {
    const { start, end } = this.form.value;
    if (end.getTime() - start.getTime() <= 0) {
      const keyToUpdate = key === 'start' ? 'end' : 'start';
      const time = this.form.value[key].getTime();
      const date = new Date(key === 'start' ? time + this.duration : time - this.duration);
      this.form.get(keyToUpdate).setValue(date);
    } else {
      this.duration = end.getTime() - start.getTime();
    }
  }
}
