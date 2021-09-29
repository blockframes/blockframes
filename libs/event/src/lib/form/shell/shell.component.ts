import { Component, ChangeDetectionStrategy, OnInit, ViewChild, TemplateRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { EventForm } from '../../form/event.form';
import { EventService } from '../../+state/event.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, applicationUrl } from '@blockframes/utils/apps';
import { Observable, of, Subscription } from 'rxjs';
import { map, pluck, switchMap } from 'rxjs/operators';
import { NavTabs, TabConfig } from '@blockframes/utils/event';

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
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.Default  // required for changes on "pristine" for the save button
})
export class EventFormShellComponent implements OnInit, OnDestroy {
  tabs$: Observable<TabConfig[]>;
  private sub: Subscription;
  private formSub: Subscription;
  form: EventForm;
  @ViewChild('confirmExit', { static: true }) confirmExitTemplate: TemplateRef<any>;
  internalLink: string;
  link: string;

  constructor(
    private service: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private routerQuery: RouterQuery,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    const eventId$ = this.route.params.pipe(pluck('eventId'));

    this.sub = eventId$.pipe(
      switchMap((eventId: string) => this.service.valueChanges(eventId))
    ).subscribe(event => {

      this.form = new EventForm(event);

      const type = this.form.value.type;
      const path = type === 'meeting' ? 'lobby' : 'session';
      this.internalLink = `/c/o/marketplace/event/${this.form.value.id}/${path}`;
      const app = getCurrentApp(this.routerQuery);
      const url = applicationUrl[app];
      this.link = `${url}${this.internalLink}`;

      this.tabs$ = this.service.valueChanges(this.form.value.id).pipe(
        map(e => e.start < new Date() ? navTabs[type].concat(statisticsTab) : navTabs[type])
      )

      // FormArray (used in FormList) does not mark as dirty on push,
      // so we do it manually to enable the save button
      // more info : https://github.com/angular/angular/issues/16370
      if (this.formSub) {
        this.formSub.unsubscribe();
        delete this.formSub;
      }
      this.formSub = this.form.meta.valueChanges.subscribe(() => this.form.markAsDirty());

      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.formSub.unsubscribe();
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

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}
