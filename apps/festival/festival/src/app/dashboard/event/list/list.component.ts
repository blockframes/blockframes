import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService } from '@blockframes/event/+state/event.service';
import { EventQuery } from '@blockframes/event/+state/event.query';
import { Event } from '@blockframes/event/+state/event.model';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventEditComponent } from '@blockframes/event/form/edit/edit.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'festival-event-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventListComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  editDialog: MatDialogRef<EventEditComponent>
  events$ = this.query.selectAll();
  viewDate = new Date();

  @ViewChild('editTemplate', {read: TemplateRef}) editTemplate: TemplateRef<EventEditComponent>;
  
  constructor(
    private service: EventService,
    private query: EventQuery,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.sub = this.service.syncCollection().subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /**
   * Open a dialog to update the event
   * @param data The event to update
   */
  edit(data: Event) {
    this.editDialog = this.dialog.open(this.editTemplate, { data });
    this.editDialog.afterClosed().pipe(
      filter(event => !!event)
    ).subscribe(async event => this.service.update(event));
  }

  remove(event: Event) {
    this.service.remove(event.id);
  }
}
