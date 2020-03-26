import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventEditComponent } from '@blockframes/event/layout/edit/edit.component';
import { EventQuery } from '@blockframes/event/+state/event.query';

@Component({
  selector: 'festival-event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditComponent implements OnInit, AfterViewInit {

  form: EventForm;
  event$ = this.query.selectActive();

  @ViewChild(EventEditComponent) editCmpt: EventEditComponent;

  constructor(private query: EventQuery) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.form = this.editCmpt.form;
  }
}
