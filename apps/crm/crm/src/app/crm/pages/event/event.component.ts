import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '@blockframes/event/+state/event.service';
import { Event, isScreening } from '@blockframes/event/+state/event.model';
import { Movie } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { InvitationDetailed, InvitationService } from '@blockframes/invitation/+state';
import { switchMap } from 'rxjs/operators';
import { getHost } from '@blockframes/invitation/pipes/host.pipe';
import { getGuest } from '@blockframes/invitation/pipes/guest.pipe';
import { OrganizationService } from '@blockframes/organization/+state';
import { where } from 'firebase/firestore';

@Component({
  selector: 'crm-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventComponent implements OnInit {
  public eventId = '';
  public event: Event;
  public movie: Movie;
  public invitations$: Observable<InvitationDetailed[]>;

  constructor(
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private eventService: EventService,
    private movieService: MovieService,
    private snackBar: MatSnackBar,
    private invitationService: InvitationService,
    private orgService: OrganizationService
  ) { }

  async ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('eventId');
    this.event = await this.eventService.getValue(this.eventId);

    if (isScreening(this.event)) {
      const titleId = this.event.meta.titleId;
      if (titleId) {
        try {
          this.movie = await this.movieService.getValue(titleId);
        } catch (err) {
          this.snackBar.open('Error while loading movie', 'close', { duration: 5000 });
        }
      } else {
        this.snackBar.open('No title id defined for this screening event..', 'close', {
          duration: 5000,
        });
      }
    }

    this.invitations$ = this.invitationService
      .valueChanges([where('type', '==', 'attendEvent'), where('eventId', '==', this.eventId)])
      .pipe(
        switchMap(async (invitations: InvitationDetailed[]) => {
          const hostOrgs = invitations.map((i) => getHost(i, 'org').id).filter((id) => id);
          const guestOrgs = invitations.map((i) => getGuest(i, 'user').orgId).filter((id) => id);
          const orgIds = Array.from(new Set(hostOrgs.concat(guestOrgs)));
          const orgsPromises = orgIds.map((id) => this.orgService.getValue(id));
          const orgs = await Promise.all(orgsPromises);

          for (const invitation of invitations) {
            invitation.org = orgs.find((org) => org.id === getHost(invitation, 'org').id);
            invitation.guestOrg = orgs.find((org) => org.id === getGuest(invitation, 'user').orgId);
            invitation.event = this.event;
            invitation.movie = this.movie;
          }
          return invitations;
        })
      );
    this.cdRef.markForCheck();
  }
}
