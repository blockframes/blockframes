import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { EventForm } from '../event.form';
import { EventService } from '../../+state/event.service';
import { Event } from '../../+state/event.model';

@Component({
  selector: 'event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventEditComponent {
  
  form = new EventForm();
  @Output() close = new EventEmitter();
  @Input() set event(event: Event) {
    if (event) {
      this.form = new EventForm(event);
    }
  }

  constructor(private service: EventService) {}

  async update() {
    await this.service.update(this.form.value);
    this.close.emit();
  }

  async remove() {
    await this.service.remove(this.form.value.id);
    this.close.emit();
  }
}
