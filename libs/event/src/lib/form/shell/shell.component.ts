import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy, Inject } from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { EventForm } from '../../form/event.form';
import { EventService } from '../../service';
import { MovieService } from '@blockframes/movie/service';
import { MatDialog } from '@angular/material/dialog';
import { applicationUrl } from '@blockframes/utils/apps';
import { Observable, of, Subscription } from 'rxjs';
import { map, pluck, switchMap } from 'rxjs/operators';
import { NavTabs, TabConfig } from '@blockframes/utils/event';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APP } from '@blockframes/utils/routes/utils';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';
import { App } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

const statisticsTab = { path: 'statistics', label: 'Attendance' };

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
  private sub: Subscription;
  form: EventForm;
  internalLink: string;
  link: string;
  errorChipMessage = '';
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
        map(e => e.start < new Date() && e.type !== 'meeting' ? navTabs[type].concat(statisticsTab) : navTabs[type])
      )

      if (type === 'screening') {
        this.checkTitleAndScreener(this.form.meta.value.titleId);
      } else if (type === 'slate') {
        this.checkSlateVideoMissing(this.form.meta.value.videoId);
      }

      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
    if (!titleId) {
      this.errorChipMessage = 'No title selected';
    } else {
      const title = await this.movieService.getValue(titleId);
      if (!title.promotional.videos?.screener?.jwPlayerId) {
        this.errorChipMessage = 'Screening file missing';
      } else if (title.app.festival.status === 'draft') {
        // Titles in draft are not allowed for screenings
        this.errorChipMessage = 'No title selected';
      } else {
        this.errorChipMessage = '';
      }
    }
    this.cdr.markForCheck();
  }

  checkSlateVideoMissing(videoId: string) {
    this.errorChipMessage = !videoId ? 'Video file missing' : '';
    this.cdr.markForCheck();
  }
}