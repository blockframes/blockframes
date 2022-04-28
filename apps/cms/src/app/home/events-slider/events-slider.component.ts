import { NgModule, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { FormEntity } from 'ng-form-factory';
import { EventsSliderSchema } from './events-slider.schema';
import { TextFormModule } from '../../forms/text';
import { FirestoreFormModule } from '../../forms/firestore';
import { FormChipsAutocompleteModule } from '../../forms/chips-autocomplete';
import { SelectFormModule } from '../../forms/select';
import { getEventsQueryConstraints, toMap } from '../pipes';
import { map } from 'rxjs/operators';
import { EventService } from '@blockframes/event/+state/event.service';
import { Event } from '@blockframes/model';


@Component({
  selector: 'form-events-slider',
  templateUrl: './events-slider.component.html',
  styleUrls: ['./events-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsSliderComponent implements OnInit {
  private mode?: 'query' | 'eventIds';
  @Input() form?: FormEntity<EventsSliderSchema>;

  events$ = this.service.valueChanges(getEventsQueryConstraints()).pipe(
    map(toMap)
  );

  displayLabel = (event?: Event) => event?.title;
  getValue = (event?: Event) => event?.id;

  constructor(
    private service: EventService
  ) { }

  get queryMode() {
    return this.mode || (this.form?.get('eventIds').length ? 'eventIds' : 'query');
  }

  private selectForm() {
    for (const key of ['eventIds', 'query'] as const) {
      this.queryMode === key
        ? this.form?.get(key).enable()
        : this.form?.get(key).disable();
    }
  }

  ngOnInit() {
    this.selectForm();
  }

  select(event: MatRadioChange) {
    this.mode = event.value;
    this.selectForm();
  }
}


@NgModule({
  declarations: [EventsSliderComponent],
  exports: [EventsSliderComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextFormModule,
    FormChipsAutocompleteModule,
    SelectFormModule,
    FirestoreFormModule,
    MatRadioModule
  ]
})
export class SliderModule { }
