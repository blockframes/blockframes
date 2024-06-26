import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy, Inject } from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { EventForm, ScreeningForm, SlateForm } from '../../form/event.form';
import { EventService } from '../../service';
import { MovieService } from '@blockframes/movie/service';
import { MatDialog } from '@angular/material/dialog';
import { applicationUrl } from '@blockframes/utils/apps';
import { Observable, of, Subscription } from 'rxjs';
import { map, pluck, switchMap, startWith, catchError } from 'rxjs/operators';
import { NavTabs, TabConfig } from '@blockframes/utils/event';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APP } from '@blockframes/utils/routes/utils';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';
import { App } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { ExplanationComponent } from '../../components/explanation/explanation.component';

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
  slate: [
    { path: 'slate', label: 'Slate Presentation' },
    { path: 'invitations', label: 'Invitations' },
  ]
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
  queryParams$ = this.route.queryParams;
  private sub: Subscription;
  private mediaSub?: Subscription;
  form: EventForm;
  internalLink: string;
  link: string;

  missing: 'title' | 'screener' | 'video' | undefined = undefined;

  constructor(
    private eventService: EventService,
    private movieService: MovieService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    @Inject(APP) private app: App
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
      const url = applicationUrl[this.app];
      this.link = `${url}${this.internalLink}`;

      this.tabs$ = this.eventService.valueChanges(this.form.value.id).pipe(
        map(e => e.start < new Date() && e.type !== 'meeting' ? navTabs[type].concat(statisticsTab) : navTabs[type]),
        catchError(() => this.router.navigate(['../..'], { relativeTo: this.route, state: { eventDeleted: true } }))
      );

      if (type === 'screening') {
        this.mediaSub?.unsubscribe();
        this.mediaSub = (this.form.meta as ScreeningForm).titleId.valueChanges.pipe(
          startWith(this.form.meta.value.titleId)
        ).subscribe(titleId => this.checkTitleAndScreener(titleId));

      } else if (type === 'slate') {
        this.mediaSub?.unsubscribe();
        this.mediaSub = (this.form.meta as SlateForm).videoId.valueChanges.pipe(
          startWith(this.form.meta.value.videoId)
        ).subscribe(videoId => this.missing = !videoId ? 'video' : undefined);
      }

      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.mediaSub?.unsubscribe();
  }

  async save(options: { showSnackbar: boolean } = { showSnackbar: true }) {
    try {
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
    catch (_) {
      this.snackBar.openFromComponent(SnackbarErrorComponent, { duration: 5000 });
    }
  }

  async remove() {
    this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: 'Are you sure to delete this event?',
        question: 'If you\'ve already sent out invites, please note that the invitation emails were already sent and cannot be taken back.',
        advice: 'You might want to contact the people concerned to let them know that this event won\'t be happening.',
        confirm: 'Yes, delete',
        cancel: 'Go back to editing',
        onConfirm: () => {
          this.eventService.remove(this.form.value.id);
          //Here we add an eventDeleted to inform the guard thatthere is no need to display the popup
          this.router.navigate(['../..'], { relativeTo: this.route, state: { eventDeleted: true } });
        }
      }),
      autoFocus: false,
    })
  }

  confirmExit() {
    if (!this.form?.dirty) {
      return true;
    }

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: 'You are about to leave the form.',
        question: 'Some changes have not been saved.',
        advice: 'If you leave now, you will lose these changes.',
        confirm: 'Save & Exit',
        cancel: 'Close without saving'
      }, 'small'),
      autoFocus: false
    });

    return dialogRef.afterClosed().pipe(
      switchMap(shouldSave => {
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
    if (!titleId) {
      this.missing = 'title';
      return;
    }

    const title = await this.movieService.getValue(titleId);
    if (!title.promotional.videos?.screener?.jwPlayerId) {
      this.missing = 'screener';
      return;
    }

    if (title.app.festival.status === 'draft') {
      this.missing = 'title';
      return;
    }

    this.missing = undefined;
  }

  scrollTo(selector: string) {
    document.querySelector(selector).scrollIntoView({ behavior: 'smooth' });
  }

  public explain() {
    this.dialog.open(ExplanationComponent, { data: createModalData({ type: this.form.value.type }), autoFocus: false });
  }

}