import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventForm } from '../../form/event.form';
import { EventService } from '@blockframes/event/+state/event.service';

@Component({
  selector: 'event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventEditComponent {

  @Input() form = new EventForm();

  constructor(
    private service: EventService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  get meta() {
    return this.form.get('meta');
  }

  save() {
    this.service.update(this.form.value);
  }

  async remove() {
    await this.service.remove(this.form.value.id);
    this.router.navigate(['../..'], { relativeTo: this.route })
  }
}
