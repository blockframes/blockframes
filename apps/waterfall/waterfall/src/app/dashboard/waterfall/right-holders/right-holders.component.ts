// Angular
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, Event, NavigationEnd } from '@angular/router';
import { InvitationService } from '@blockframes/invitation/service';
import { InvitationDetailed, getGuest } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { filters } from '@blockframes/ui/list/table/filters';
import { NavigationService } from '@blockframes/ui/navigation.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { where } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { filter, pluck, switchMap } from 'rxjs/operators';

@Component({
  selector: 'waterfall-right-holders',
  templateUrl: './right-holders.component.html',
  styleUrls: ['./right-holders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightHoldersComponent implements OnInit, OnDestroy {
  private sub: Subscription;

  private countRouteEvents = 1;

  filters = filters;

  movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId))
  );

  invitations$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((waterfallId: string) => {
      const query = [
        where('type', '==', 'joinWaterfall'),
        where('waterfallId', '==', waterfallId),
        where('fromOrg.id', '==', this.organizationService.org.id),
      ];
      return this.invitationService.valueChanges(query);
    }),
    switchMap(async (invitations: InvitationDetailed[]) => {
      const guestOrgs = invitations.map(i => getGuest(i, 'user').orgId).filter((id) => id);
      const orgIds = Array.from(new Set(guestOrgs));
      const orgsPromises = orgIds.map((id) => this.organizationService.getValue(id));
      const orgs = await Promise.all(orgsPromises);
      for (const invitation of invitations) {
        invitation.guestOrg = orgs.find((org) => org.id === getGuest(invitation, 'user').orgId);
      }
      return invitations;
    }),
  );

  constructor(
    private movieService: MovieService,
    private invitationService: InvitationService,
    private organizationService: OrganizationService,
    private waterfallService: WaterfallService,
    private router: Router,
    private route: ActivatedRoute,
    private navService: NavigationService,
    private dynTitle: DynamicTitleService,
    private snackBar: MatSnackBar,
  ) {
    this.dynTitle.setPageTitle('Manage right holders');
  }

  ngOnInit() {
    this.sub = this.router.events
      .pipe(filter((event: Event) => event instanceof NavigationEnd))
      .subscribe(() => this.countRouteEvents++);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  goBack(movieId: string) {
    this.navService.goBack(this.countRouteEvents, ['/c/o/dashboard/title', movieId]);
  }

  async resendInvitation(invitation: InvitationDetailed) {
    const fromOrg = this.organizationService.org;
    await this.invitationService.remove(invitation.id);
    await this.invitationService.invite([invitation.toUser.email], fromOrg)
      .to('joinWaterfall', invitation.waterfallId, { roles: invitation.data.roles });
    this.snackBar.open('Invitation sent again', 'close', { duration: 5000 });
  }

  async removeRightHolder(invitation: InvitationDetailed) {
    await this.invitationService.remove(invitation.id);
    if (invitation.status === 'accepted' && invitation.guestOrg?.id) {
      await this.waterfallService.removeOrg(invitation.waterfallId, invitation.guestOrg.id);
    }
  }
}

