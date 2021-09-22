import { Component, ChangeDetectionStrategy, Input, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventForm } from '../../form/event.form';
import { EventService } from '../../+state/event.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, applicationUrl } from '@blockframes/utils/apps';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

type TabConfig = { path: string, label: string };
type NavTabs = { screening: TabConfig[], meeting: TabConfig[] };
const statisticsTab = { path: 'statistics', label: 'Statistics' };

const navTabs: NavTabs = {
  screening: [
    { path: 'screening', label: 'Screening' },
    { path: 'invitations', label: 'Invitations' }
  ],
  meeting: [
    { path: 'meeting', label: 'Meeting' },
    { path: 'invitations', label: 'Invitations' },
    { path: 'files', label: 'Files' },
  ],
}
@Component({
  selector: 'event-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default  // required for changes on "pristine" for the save button
})
export class EventFormShellComponent implements OnInit {
  tabs$: Observable<TabConfig[]>;
  @Input() form = new EventForm();
  @ViewChild('confirmExit', { static: true }) confirmExitTemplate: TemplateRef<any>;
  internalLink: string;
  link: string;

  constructor(
    private service: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private routerQuery: RouterQuery,
  ) { }

  ngOnInit() {
    const type = this.form.value.type;
    const path = type === 'meeting' ? 'lobby' : 'session';
    this.internalLink = `/c/o/marketplace/event/${this.form.value.id}/${path}`;
    const app = getCurrentApp(this.routerQuery);
    const url = applicationUrl[app];
    this.link = `${url}${this.internalLink}`;

    this.tabs$ = this.service.valueChanges(this.form.value.id).pipe(
      map(e => e.start < new Date() ? navTabs[type].concat(statisticsTab): navTabs[type])
    )
  }

  save() {
    if (this.form.valid && this.form.dirty) {
      const value = this.form.value;
      if (this.form.value.allDay) {
        value.start.setHours(0, 0, 0);
        value.end.setHours(23, 59, 59);
      }
      this.service.update(value);
      this.form.markAsPristine();
    }
    return true;
  }

  async remove() {
    this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Are you sure you want to delete this event ?',
        question: 'All of the invitations and requests associated to it will be deleted.',
        confirm: 'Delete',
        onConfirm: () => {
          this.service.remove(this.form.value.id);
          //Here we add an eventDeleted to inform the guard thatthere is no need to display the popup
          this.router.navigate(['../..'], { relativeTo: this.route, state: { eventDeleted: true } });
        },
      },
      autoFocus: false,
    })
  }

  confirmExit() {
    if (!this.form.dirty) {
      return true;
    }

    const dialogRef = this.dialog.open(this.confirmExitTemplate, {
      width: '80%'
    });
    return dialogRef.afterClosed().pipe(
      switchMap(shouldSave => {
        /* Undefined means user clicked on the backdrop, meaning just close the modal */
        if (typeof shouldSave === 'undefined') {
          return of(false);
        }
        return shouldSave ? of(this.save()) : of(true);
      })
    );
  }
}
