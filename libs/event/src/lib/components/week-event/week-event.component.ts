import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEvent } from 'angular-calendar';
import { EventService } from '../../+state/event.service';
import { EventEditComponent } from '../../form/edit/edit.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'cal-week-event',
  templateUrl: './week-event.component.html',
  styleUrls: ['./week-event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition('void => true', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('200ms cubic-bezier(0.16, 1, 0.3, 1)')
      ]),
    ]),
    trigger('fadeOut', [
      transition(':leave', [
        animate('200ms cubic-bezier(0.7, 0, 0.84, 0)', style({ opacity: 0, transform: 'translateY(20px)' }))
      ]),
    ])
  ],
})
export class CalendarWeekEventComponent implements OnInit {
  @ViewChild(TemplateRef) template: TemplateRef<any>;
  constructor(
    private dialog: MatDialog,
    private service: EventService
  ) { }

  ngOnInit(): void {
  }

  edit(data: CalendarEvent) {
    const ref = this.dialog.open(EventEditComponent, { width: '60%', data });
    ref.afterClosed().pipe(filter(e => !!e)).subscribe(event => this.service.update(event));
  }
}
