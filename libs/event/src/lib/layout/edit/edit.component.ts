import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventForm } from '../../form/event.form';
import { EventService } from '../../+state/event.service';
import { MEETING_MAX_INVITATIONS_NUMBER } from '../../+state/event.firestore';
import { Invitation }  from '@blockframes/invitation/+state/invitation.model';
import { createAlgoliaUserForm } from '@blockframes/utils/algolia';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default  // required for changes on "pristine" for the save button
})
export class EventEditComponent implements OnInit, OnDestroy {

  @Input() form = new EventForm();
  @Input() invitations: Invitation[] = [];
  invitationForm = createAlgoliaUserForm();
  progress: Observable<number>;
  sending = new BehaviorSubject(false);
  eventLink: string;
  limit = Infinity;
  sub: Subscription;

  private _previousStartValue: Date;
  private _previousEndValue: Date;

  constructor(
    private service: EventService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    if (this.form.value.type === 'meeting') {
      this.limit = MEETING_MAX_INVITATIONS_NUMBER;
    }
    this.eventLink = `/c/o/marketplace/event/${this.form.value.id}/session`;

    this._previousStartValue = new Date(this.form.get('start').value);
    this._previousEndValue = new Date(this.form.get('end').value);

    this.sub = this.form.valueChanges.subscribe(value => {
      if (value.start >= this._previousEndValue) {
        const diff = Math.abs(this._previousStartValue.getTime() - value.start.getTime());
        const movedDate = new Date(this._previousEndValue.getTime() + diff);
        this.form.get('end').setValue(movedDate, { emitEvent: false });
      }

      if (value.end <= this._previousStartValue) {
        const diff = Math.abs(this._previousEndValue.getTime() - value.end.getTime());
        const movedDate = new Date(this._previousStartValue.getTime() - diff);
        this.form.get('start').setValue(movedDate, { emitEvent: false });
      }

      this._previousStartValue = new Date(this.form.get('start').value);
      this._previousEndValue = new Date(this.form.get('end').value);
    });

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
    this.router.navigate(['../..'], { relativeTo: this.route })
    this.service.remove(this.form.value.id);
  }

}
