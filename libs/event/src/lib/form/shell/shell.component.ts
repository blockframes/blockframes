import { Component, ChangeDetectionStrategy, OnInit, ViewChild, TemplateRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { EventForm } from '../../form/event.form';
import { EventService } from '../../+state/event.service';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, applicationUrl } from '@blockframes/utils/apps';
import { Observable, of, Subscription } from 'rxjs';
import { map, pluck, switchMap } from 'rxjs/operators';
import { NavTabs, TabConfig } from '@blockframes/utils/event';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventFormShellComponent implements OnInit, OnDestroy {
  tabs$: Observable<TabConfig[]>;
  private sub: Subscription;
  form: EventForm;
  @ViewChild('confirmExit') confirmExitTemplate: TemplateRef<any>;
  internalLink: string;
  link: string;
  screenerMissing: boolean;
  titleMissing: boolean;

  constructor(
    private eventService: EventService,
    private movieService: MovieService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private routerQuery: RouterQuery,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const eventId$ = this.route.params.pipe(pluck('eventId'));

    this.sub = eventId$.pipe(
      switchMap((eventId: string) => this.eventService.valueChanges(eventId))
    ).subscribe(async event => {
      this.form = new EventForm(event);

      const type = this.form.value.type;
      const path = type === 'meeting' ? 'lobby' : 'session';
      this.internalLink = `/event/${this.form.value.id}/r/i/${path}`;
      const app = getCurrentApp(this.routerQuery);
      const url = applicationUrl[app];
      this.link = `${url}${this.internalLink}`;

      this.tabs$ = this.eventService.valueChanges(this.form.value.id).pipe(
        map(e => e.start < new Date() && e.type !== 'meeting' ? navTabs[type].concat(statisticsTab) : navTabs[type])
      )

      if (this.form.value.type === 'screening') {
        this.checkTitleAndScreener(this.form.meta.value.titleId);
      }

      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async save(options: { showSnackbar: boolean } = { showSnackbar: true }) {
    if (this.form.valid && this.form.dirty) {
      const value = this.form.value;
      if (this.form.value.allDay) {
        value.start.setHours(0, 0, 0);
        value.end.setHours(23, 59, 59);
      }
      await this.eventService.update(value);
      this.form.markAsPristine();
      this.cdr.markForCheck();
      if (options.showSnackbar) {
        this.snackBar.open('Event saved', 'CLOSE', { duration: 4000 });
      }
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
          this.eventService.remove(this.form.value.id);
          //Here we add an eventDeleted to inform the guard thatthere is no need to display the popup
          this.router.navigate(['../..'], { relativeTo: this.route, state: { eventDeleted: true } });
        },
      },
      autoFocus: false,
    })
  }

  confirmExit() {
    if (!this.form?.dirty) {
      return true;
    }

    const dialogRef = this.dialog.open(this.confirmExitTemplate, {
      width: '80%',
      minWidth: '50vw',
      autoFocus: false,
    });
    return dialogRef.afterClosed().pipe(
      switchMap(shouldSave => {
        console.log("shouldSave", shouldSave)

        /* Undefined means user clicked on the backdrop, meaning just close the modal */
        if (typeof shouldSave === 'undefined') {
          return of(false);
        }
        return shouldSave ? this.save() : of(true);
      })
    );
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }

  async checkTitleAndScreener(titleId: string) {
    if(!titleId) {
      this.titleMissing = true;
    } else {
      this.titleMissing = false;
      const title = await this.movieService.getValue(titleId);
      this.screenerMissing = !title.promotional.videos?.screener?.jwPlayerId;
    }
    this.cdr.markForCheck();
  }
}
