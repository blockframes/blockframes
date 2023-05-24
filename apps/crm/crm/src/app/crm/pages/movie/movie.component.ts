import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieCrmForm } from '@blockframes/admin/crm/forms/movie-crm.form';
import {
  Movie,
  storeStatus,
  productionStatus,
  getAllAppsExcept,
  Analytics,
  AggregatedAnalytic,
  StoreStatus,
  Organization,
  User,
  filterOwnerEvents,
  deletedIdentifier
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationService } from '@blockframes/organization/service';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { EventService } from '@blockframes/event/service';
import { InvitationService } from '@blockframes/invitation/service';
import { PermissionsService } from '@blockframes/permissions/service';
import { ContractService } from '@blockframes/contract/contract/service';
import { CampaignService } from '@blockframes/campaign/service';
import { MovieAppConfigForm } from '@blockframes/movie/form/movie.form';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { QueryConstraint, where } from 'firebase/firestore';
import { AnalyticsService } from '@blockframes/analytics/service';
import { map, Observable, startWith } from 'rxjs';
import { aggregatePerUser } from '@blockframes/analytics/utils';
import { joinWith } from 'ngfire';
import { UserService } from '@blockframes/user/service';
import { UntypedFormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';

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
  public orgs: Organization[];
  public createdBy: User;
  public deletedUserIdentifier = deletedIdentifier.user;

  public keywords$: Observable<string[]>;
  public keywordForm = new UntypedFormControl();
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  public analytics$: Observable<AggregatedAnalytic[]>;

  constructor(
    private analytics: AnalyticsService,
    private movieService: MovieService,
    private organizationService: OrganizationService,
    private permissionsService: PermissionsService,
    private waterfallService: WaterfallService,
    private waterfallPermissionService: WaterfallPermissionsService,
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
  ) { }

  async ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('movieId');
    this.movie = await this.movieService.getValue(this.movieId);
    this.orgs = await this.organizationService.getValue(this.movie.orgIds);
    this.createdBy = this.movie._meta.createdBy ? await this.userService.getValue(this.movie._meta.createdBy) : undefined;

    this.movieForm = new MovieCrmForm(this.movie);
    this.movieAppConfigForm = new MovieAppConfigForm(this.movie.app);

    this.keywords$ = this.movieForm.keywords.valueChanges.pipe(startWith(this.movieForm.keywords.value));

    const query: QueryConstraint[] = [
      where('type', '==', 'title'),
      where('meta.titleId', '==', this.movieId)
    ];
    this.analytics$ = this.analytics.valueChanges(query).pipe(
      map((analytics: Analytics<'title'>[]) => filterOwnerEvents(analytics)),
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
      keywords: this.movieForm.keywords.value,
    };

    const hasCampaign = await this.campaignService.getValue(this.movieId);

    if (
      hasCampaign &&
      !this.movie?.campaignStarted &&
      this.movie.app.financiers.status === 'accepted'
    ) {
      this.movie.campaignStarted = new Date();
    }

    const hasWaterfall = await this.waterfallService.getValue(this.movie.id);

    if (!hasWaterfall && this.movie.app.waterfall.access) {
      await this.waterfallService.create(this.movie.id, this.movie.orgIds);
      const promises = this.movie.orgIds.map(orgId =>
        this.waterfallPermissionService.create(this.movie.id, { id: orgId, roles: ['producer'] })
      );
      await Promise.all(promises);
    }

    await this.movieService.update(this.movieId, this.movie);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  public updateAppAccess() {
    if (this.movieAppConfigForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
    }

    for (const application of this.apps) {

      const newStatus: StoreStatus = this.movieAppConfigForm.controls[application].get('status').value;

      if (this.movie.app[application].status !== 'accepted' && newStatus === 'accepted') {
        this.movie.app[application].acceptedAt = new Date();
      } else if (this.movie.app[application].acceptedAt && newStatus !== 'accepted') {
        this.movie.app[application].acceptedAt = null;
      }

      if (this.movie.app[application].status !== 'refused' && newStatus === 'refused') {
        this.movie.app[application].refusedAt = new Date();
      } else if (this.movie.app[application].refusedAt && newStatus !== 'refused') {
        this.movie.app[application].refusedAt = null;
      }

      if (this.movie.app[application].status !== 'submitted' && newStatus === 'submitted') {
        this.movie.app[application].submittedAt = new Date();
      } else if (this.movie.app[application].submittedAt && newStatus !== 'submitted') {
        this.movie.app[application].submittedAt = null;
      }

      this.movie.app[application].access = this.movieAppConfigForm.controls[application].get('access').value;
      this.movie.app[application].status = newStatus;
    }

    return this.movie.app;
  }

  public addKeyword(event: MatChipInputEvent): void {
    const { value = '' } = event;

    this.movieForm.keywords.add(value.trim());
    this.keywordForm.reset();
  }

  public removeKeyword(i: number): void {
    this.movieForm.keywords.removeAt(i);
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

    const documentPermissions = await Promise.all(movie.orgIds.map(orgId => this.permissionsService.getDocumentPermissions(movie.id, orgId)));
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
