import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EventService } from '@blockframes/event/+state/event.service';
import { EventQuery } from '@blockframes/event/+state/event.query';
import { Event } from '@blockframes/event/+state/event.model';
import { EventForm } from '@blockframes/event/form/event.form';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'festival-event-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventListComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  editDialog: MatDialogRef<any>
  events$ = this.query.selectAll();
  viewDate = new Date();

  @ViewChild('editTemplate', {read: TemplateRef}) editTemplate: TemplateRef<any>;
  
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
  async edit(data: Event) {
    this.editDialog = this.dialog.open(this.editTemplate, { data: new EventForm(data) });
    this.editDialog.afterClosed().pipe(
      tap(console.log),
      filter(event => !!event)
    ).subscribe(async event => this.service.update(event));
  }

  remove(event: Event) {
    this.service.remove(event.id);
  }
}
