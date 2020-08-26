import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventForm } from '../../form/event.form';
import { EventService } from '../../+state/event.service';
import { Invitation }  from '@blockframes/invitation/+state/invitation.model';
import { createAlgoliaUserForm } from '@blockframes/utils/algolia';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default  // required for changes on "pristine" for the save button
})
export class EventEditComponent {

  @Input() form = new EventForm();
  @Input() invitations: Invitation[] = [];
  invitationForm = createAlgoliaUserForm();
  progress: Observable<number>;
  sending = new BehaviorSubject(false);

  constructor(
    private service: EventService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

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
