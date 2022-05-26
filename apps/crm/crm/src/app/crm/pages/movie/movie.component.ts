import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieCrmForm } from '@blockframes/admin/crm/forms/movie-crm.form';
import { Movie, storeStatus, productionStatus, getAllAppsExcept, Analytics, EventName, AggregatedAnalytic } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationService } from '@blockframes/organization/service';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { EventService } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import { ContractService } from '@blockframes/contract/contract/service';
import { CampaignService } from '@blockframes/campaign/service';
import { MovieAppConfigForm } from '@blockframes/movie/form/movie.form';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { QueryConstraint, where } from 'firebase/firestore';
import { AnalyticsService } from '@blockframes/analytics/service';
import { map, Observable } from 'rxjs';
import { aggregatePerUser } from '@blockframes/analytics/utils';
import { joinWith } from 'ngfire';
import { UserService } from '@blockframes/user/service';

const eventLabel: Record<EventName, string> = {
  addedToWishlist: 'Added to Wishlist',
  askingPriceRequested: 'Asking Price Requested',
  pageView: 'Page Views',
  promoReelOpened: 'Promoreel Opened',
  removedFromWishlist: 'Removed from Wishlist',
  screeningRequested: 'Screening Requested'
}

@Component({
  selector: 'crm-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieComponent implements OnInit {
  public movieId = '';
  public movie: Movie;
  public movieForm: MovieCrmForm;
  public movieAppConfigForm: MovieAppConfigForm;
  public storeStatus = storeStatus;
  public productionStatus = productionStatus;
  public apps = getAllAppsExcept(['crm']);

  public analytics$: Observable<AggregatedAnalytic[]>;
  public eventLabel = eventLabel;

  constructor(
    private analytics: AnalyticsService,
    private movieService: MovieService,
    private organizationService: OrganizationService,
    private permissionsService: PermissionsService,
    private eventService: EventService,
    private invitationService: InvitationService,
    private contractService: ContractService,
    private campaignService: CampaignService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private userService: UserService
  ) {}

  async ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('movieId');
    this.movie = await this.movieService.getValue(this.movieId);
    this.movieForm = new MovieCrmForm(this.movie);
    this.movieAppConfigForm = new MovieAppConfigForm(this.movie.app);

    const query: QueryConstraint[] = [
      where('type', '==', 'title'),
      where('meta.titleId', '==', this.movieId)
    ];
    this.analytics$ = this.analytics.valueChanges(query).pipe(
      // Filter out analytics from owners of title
      map((analytics: Analytics<'title'>[]) => analytics.filter(analytic => !analytic.meta.ownerOrgIds.includes(analytic.meta.orgId) )),
      joinWith({
        org: analytic => this.organizationService.valueChanges(analytic.meta.orgId),
        user: analytic => this.userService.valueChanges(analytic.meta.uid)
      }, { shouldAwait: true }),
      map(aggregatePerUser)
    );

    this.cdRef.markForCheck();
  }

  public async update() {
    if (this.movieForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    this.movie = {
      ...this.movie,
      app: this.updateAppAccess(),
      productionStatus: this.movieForm.get('productionStatus').value,
      internalRef: this.movieForm.get('internalRef').value,
      orgIds: this.movieForm.get('orgIds').value,
    };

    const hasCampaign = await this.campaignService.getValue(this.movieId);

    if (
      hasCampaign &&
      !this.movie?.campaignStarted &&
      this.movie.app.financiers.status === 'accepted'
    ) {
      this.movie.campaignStarted = new Date();
    }

    await this.movieService.update(this.movieId, this.movie);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  public updateAppAccess() {
    if (this.movieAppConfigForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
    }

    for (const application of this.apps) {
      this.movie.app[application].refusedAt = null;
      this.movie.app[application].acceptedAt = null;
      this.movie.app[application].access = this.movieAppConfigForm.controls[application].get(
        'access'
      ).value;
      this.movie.app[application].status = this.movieAppConfigForm.controls[application].get(
        'status'
      ).value;

      if (this.movieAppConfigForm.controls[application].get('status').value === 'accepted') {
        this.movie.app[application].acceptedAt = new Date();
      }
      if (this.movieAppConfigForm.controls[application].get('status').value === 'refused') {
        this.movie.app[application].refusedAt = new Date();
      }
    }

    return this.movie.app;
  }

  public async deleteMovie() {
    const simulation = await this.simulateDeletion(this.movie);
    this.dialog.open(ConfirmInputComponent, {
      data: createModalData({
        title: 'You are about to delete this movie from Archipel, are you sure ?',
        text: "If yes, please write 'HARD DELETE' inside the form below.",
        warning: 'Doing this will also delete everything regarding this movie',
        simulation,
        confirmationWord: 'hard delete',
        confirmButtonText: 'delete',
        onConfirm: async () => {
          await this.movieService.remove(this.movie.id);
          this.snackBar.open('Movie deleted !', 'close', { duration: 5000 });
          this.router.navigate(['c/o/dashboard/crm/movies']);
        }
      })
    });
  }

  /**
   * Used to see what will be deleted before actual removal
   * @param movie
   */
  private async simulateDeletion(movie: Movie) {
    const output: string[] = [];
    output.push('1 movie will be removed.');

    const whislists = await this.organizationService.getValue([where('wishlist', 'array-contains', movie.id)]);
    if (whislists.length) {
      output.push(`${whislists.length} items from org's wishlist will be removed.`);
    }

    const events = await this.eventService.getValue([where('meta.titleId', '==', movie.id)]);
    if (events.length) {
      output.push(`${events.length} event(s) will be removed.`);
    }

    const eventIds = events.map((e) => e.id);

    const invitationsPromises = eventIds.map((e) =>
      this.invitationService.getValue([where('eventId', '==', e)])
    );
    const invitations = await Promise.all(invitationsPromises);
    const invitationsCount = invitations.flat().length;

    if (invitationsCount) {
      output.push(`${invitationsCount} invitations to events will be removed.`);
    }

    const orgPromises = movie.orgIds.map((o) =>
      this.organizationService.getValue([where('id', '==', o)])
    );
    const orgs = await Promise.all(orgPromises);
    const promises = orgs
      .flat()
      .map((o) => this.permissionsService.getDocumentPermissions(movie.id, o.id));
    const documentPermissions = await Promise.all(promises);
    if (documentPermissions.length) {
      output.push(`${documentPermissions.length} permission document will be removed.`);
    }

    const contracts = await this.contractService.getValue([where('titleId', '==', movie.id)]);
    if (contracts.length) {
      output.push(`${contracts.length} contract will be deleted.`);
    }

    // Check buckets content
    /**
     * @dev query cannot be performed unless we retreive all buckets on browser side,
     * For performances issues, we just say that some buckets may be impacted
     */
    output.push('Some buckets may be updated.');

    return output;
  }
}
