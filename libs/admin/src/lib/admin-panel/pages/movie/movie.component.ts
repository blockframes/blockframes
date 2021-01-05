import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieAdminForm, MovieAppAccessAdminForm } from '../../forms/movie-admin.form';
import { DistributionRightService } from '@blockframes/distribution-rights/+state/distribution-right.service';
import { getValue } from '@blockframes/utils/helpers';
import { storeType, storeStatus, staticModel } from '@blockframes/utils/static-model';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { app } from '@blockframes/utils/apps';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationService } from '@blockframes/organization/+state';
import { CrmFormDialogComponent } from '../../components/crm-form-dialog/crm-form-dialog.component';
import { EventService } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { DistributionRightDocumentWithDates } from '@blockframes/distribution-rights/+state/distribution-right.firestore';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import { ContractService } from '@blockframes/contract/contract/+state';
import { CampaignService } from '@blockframes/campaign/+state';


@Component({
  selector: 'admin-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieComponent implements OnInit {
  public movieId = '';
  public movie: Movie;
  public movieForm: MovieAdminForm;
  public movieAppAccessForm: MovieAppAccessAdminForm;
  public storeType = storeType;
  public storeStatus = storeStatus;
  public staticConsts = staticModel;
  public app = app;
  public rights: DistributionRightDocumentWithDates[] = [];

  public versionColumnsTable = {
    'id': { value: 'Id', disableSort: true },
    'status': 'Status',
    'contractId': 'Contract Id',
    'terms': 'Scope',
  };

  public initialColumnsTable: string[] = [
    'id',
    'status',
    'contractId',
    'terms',
  ];

  constructor(
    private movieService: MovieService,
    private organizationService: OrganizationService,
    private permissionsService: PermissionsService,
    private eventService: EventService,
    private invitationService: InvitationService,
    private distributionRightService: DistributionRightService,
    private contractService: ContractService,
    private campaignService: CampaignService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('movieId');
    this.movie = await this.movieService.getValue(this.movieId);
    this.movieForm = new MovieAdminForm(this.movie);
    this.movieAppAccessForm = new MovieAppAccessAdminForm(this.movie);

    this.rights = await this.distributionRightService.getMovieDistributionRights(this.movieId);

    this.cdRef.markForCheck();
  }

  public async update() {
    if (this.movieForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    this.movie = {
      ...this.movie,
      storeConfig: {
        ...this.movie.storeConfig,
        status: this.movieForm.get('storeStatus').value,
        storeType: this.movieForm.get('storeType').value
      },
      productionStatus: this.movieForm.get('productionStatus').value,
      internalRef: this.movieForm.get('internalRef').value
    }

    const hasCampaign = await this.campaignService.getValue(this.movieId);

    if (hasCampaign && !this.movie?.campaignStarted && this.movie.storeConfig.status === 'accepted') {
      this.movie.campaignStarted = new Date();
    }

    await this.movieService.update(this.movieId, this.movie);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  public async updateAppAccess() {
    if (this.movieAppAccessForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
    }

    this.movie.storeConfig.appAccess = this.movieAppAccessForm.value;

    await this.movieService.update(this.movieId, this.movie);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'id',
      'status',
      'contractId',
      'terms',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  public async deleteMovie() {
    const simulation = await this.simulateDeletion(this.movie);
    this.dialog.open(CrmFormDialogComponent, {
      data: {
        question: 'You are about to delete this movie from Archipel, are you sure ?',
        warning: 'Doing this will also delete everything regarding this movie',
        simulation,
        confirmationWord: 'DELETE',
        onConfirm: async () => {
          await this.movieService.remove(this.movie.id);
          this.snackBar.open('Movie deleted !', 'close', { duration: 5000 });
          this.router.navigate(['c/o/admin/panel/movies']);
        }
      }
    });
  }

  /**
   * Used to see what will be deleted before actual removal
   * @param movie
   */
  private async simulateDeletion(movie: Movie) {
    const output: string[] = [];
    output.push('1 movie will be removed.');

    const whislists = await this.organizationService.getValue(ref => ref.where('wishlist', 'array-contains', movie.id));
    if (whislists.length) {
      output.push(`${whislists.length} items from org's wishlist will be removed.`);
    }

    const events = await this.eventService.getValue(ref => ref.where('meta.titleId', '==', movie.id));
    if (events.length) {
      output.push(`${events.length} event(s) will be removed.`);
    }

    const eventIds = events.map(e => e.id);

    const invitationsPromises = eventIds.map(e => this.invitationService.getValue(ref => ref.where('eventId', '==', e)));
    const invitations = await Promise.all(invitationsPromises);
    const invitationsCount = invitations.flat().length;

    if (invitationsCount) {
      output.push(`${invitationsCount} invitations to events will be removed.`);
    }

    if (this.rights.length) {
      output.push(`${this.rights.length} distribution rights will be removed.`);
    }

    const orgPromises = movie.orgIds.map(o => this.organizationService.getValue(ref => ref.where('id', '==', o)));
    const orgs = await Promise.all(orgPromises);
    const promises = orgs.flat().map(o => this.permissionsService.getDocumentPermissions(movie.id, o.id));
    const documentPermissions = await Promise.all(promises);
    if (documentPermissions.length) {
      output.push(`${documentPermissions.length} permission document will be removed.`);
    }

    const contracts = await this.contractService.getValue(ref => ref.where('titleIds', 'array-contains', movie.id));
    if (contracts.length) {
      output.push(`${contracts.length} contract will be updated.`);
    }

    return output;
  }

  goToRights(right: DistributionRightDocumentWithDates) {
    this.router.navigate([`/c/o/admin/panel/right/${right.id}/m/${this.movieId}`]);
  }

}
