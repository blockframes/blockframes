import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { EventForm, MeetingForm } from '@blockframes/event/form/event.form';
import { EventService } from '@blockframes/event/+state';
import { EventTypes } from '@blockframes/event/+state/event.firestore';
import { EventEditComponent } from '@blockframes/event/layout/edit/edit.component';
import { fromOrgAndAccepted, Movie, MovieService } from '@blockframes/movie/+state';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { User } from '@blockframes/auth/+state';
import { Observable, Subscription } from 'rxjs';
import { switchMap, pluck, map, take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatDialog } from '@angular/material/dialog';
import { FilePickerComponent } from '@blockframes/media/file/picker/picker.component';
import { getCurrentApp, applicationUrl } from "@blockframes/utils/apps";
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { FilePreviewComponent } from '@blockframes/media/file/preview/preview.component';
import { StorageFile } from '@blockframes/media/+state/media.firestore';

@Component({
  selector: 'festival-event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  animations: [slideUpList('h2, mat-card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  private formSub: Subscription;
  link: string;
  form: EventForm;
  titles$: Observable<Movie[]>;
  invitations$: Observable<Invitation[]>;
  members$: Observable<User[]>;
  type: EventTypes;

  @ViewChild(EventEditComponent) editCmpt: EventEditComponent;

  constructor(
    private service: EventService,
    private movieService: MovieService,
    private invitationService: InvitationService,
    private userService: UserService,
    private orgQuery: OrganizationQuery,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private dialog: MatDialog,
    private routerQuery: RouterQuery
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Screening info');
    const eventId$ = this.route.params.pipe(pluck('eventId'));

    this.invitations$ = eventId$.pipe(
      switchMap((eventId) => this.invitationService.valueChanges(ref => ref.where('type', '==', 'attendEvent').where('eventId', '==', eventId)))
    );

    // will be executed only if "screening" as Observable are lazy
    this.titles$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.movieService.valueChanges(fromOrgAndAccepted(org.id)))
    );

    this.members$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.userService.valueChanges(org.userIds))
    )

    this.sub = eventId$.pipe(
      switchMap((eventId: string) => this.service.valueChanges(eventId))
    ).subscribe(event => {
      const app = getCurrentApp(this.routerQuery);
      const url = applicationUrl[app];
      if (this.type === "meeting") {
        this.link = `${url}/c/o/marketplace/event/${event.id}/lobby`;
      } else {
        this.link = `${url}/c/o/marketplace/event/${event.id}/session`;
      }

      this.type = event.type;
      this.form = new EventForm(event);

      // FormArray (used in FormList) does not mark as dirty on push,
      // so we do it manually to enable the save button
      // more info : https://github.com/angular/angular/issues/16370
      if (!!this.formSub) {
        this.formSub.unsubscribe();
        delete this.formSub;
      }
      this.formSub = this.form.meta.valueChanges.subscribe(() => this.form.markAsDirty());

      this.cdr.markForCheck();
    });
  }

  // Will be used to show event statistics only if event started
  isEventStarted() {
    const start = this.form.get('start').value as Date;
    return start.getTime() < Date.now();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.formSub.unsubscribe();
  }

  get files() {
    return (this.form.meta as MeetingForm).get('files');
  }

  removeSelectedFile(index: number, $event: Event) {
    $event.stopPropagation();
    this.files.removeAt(index);
  }

  previewFile(ref: StorageFile) {
    this.dialog.open(FilePreviewComponent, { data: { ref }, width: '80vw', height: '80vh' })
  }

  openFileSelector() {
    this.dialog.open(FilePickerComponent, {
      width: '80%',
      height: '80%',
      disableClose: true,
      data: {
        selectedFiles: this.files.value,
      }
    }).afterClosed().pipe(take(1)).subscribe(result => {
      this.files.patchAllValue(result);
      this.cdr.markForCheck();
    });
  }
}
