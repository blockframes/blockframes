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
  public rows: any[] = [];
  public app = app;
  private rights: DistributionRightDocumentWithDates[] = [];

  public versionColumnsTable = {
    'id': 'Id',
    'status': 'Status',
    'contractId': 'Contract Id',
    'terms': 'Scope',
    'rightLink': 'Edit'
  };

  public initialColumnsTable: string[] = [
    'id',
    'status',
    'contractId',
    'terms',
    'rightLink',
  ];

  constructor(
    private movieService: MovieService,
    private organizationService: OrganizationService,
    private eventService: EventService,
    private invitationService: InvitationService,
    private distributionRightService: DistributionRightService,
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
    this.rows = this.rights.map(d => ({ ...d, rightLink: { id: d.id, movieId: this.movieId } }));

    this.cdRef.markForCheck();
  }

  public async update() {
    if (this.movieForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    this.movie.storeConfig.status = this.movieForm.get('storeStatus').value;
    this.movie.storeConfig.storeType = this.movieForm.get('storeType').value;
    this.movie.productionStatus = this.movieForm.get('productionStatus').value;
    this.movie.internalRef = this.movieForm.get('internalRef').value;

    await this.movieService.updateById(this.movieId, this.movie);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  public async updateAppAccess() {
    if (this.movieAppAccessForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
    }

    this.movie.storeConfig.appAccess = this.movieAppAccessForm.value;

    await this.movieService.updateById(this.movieId, this.movie);

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
    const simulation = await this.simulateDeletion(this.movieId);
    this.dialog.open(CrmFormDialogComponent, {
      data: {
        question: 'You are about to delete this movie from Archipel, are you sure ?',
        warning: 'Doing this will also delete everything regarding this movie',
        simulation,
        confirmationWord: 'DELETE',
        onConfirm: () => {
          // this.organizationService.remove(this.orgId);
          this.snackBar.open('Movie deleted !', 'close', { duration: 5000 });
          this.router.navigate(['c/o/admin/panel/movies']);
        }
      }
    });
  }


  private async simulateDeletion(movieId: string) { // get what will be delete. le vrai delete se fait coté backend
    const output: string[] = [];
    output.push('1 document from movies collection will be removed');

    const whislists = await this.organizationService.getValue(ref => ref.where('wishlist', 'array-contains', movieId));
    output.push(`${whislists.length} items from org's wishlist will be removed`);

    const events = await this.eventService.getValue(ref => ref.where('meta.titleId', '==', movieId));
    output.push(`${events.length} documents from events collection will be removed`);

    const invitations = await this.invitationService.getValue(ref => ref.where('docId', 'in', events.map(e => e.id)));
    output.push(`${invitations.length} invitations to events will be removed`);

    output.push(`${this.rights.length} distribution rights will be removed`);

    return output;
  }

}
