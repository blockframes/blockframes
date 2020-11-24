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
import { DeleteDialogComponent } from '../../components/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationService } from '@blockframes/organization/+state';

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

    const rights = await this.distributionRightService.getMovieDistributionRights(this.movieId)
    this.rows = rights.map(d => ({ ...d, rightLink: { id: d.id, movieId: this.movieId } }));

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

  public deleteMovie() {
    this.testWishlist(this.movieId)
    this.dialog.open(DeleteDialogComponent, {
      data: {
        entity: 'movie',
        deletion: 'You will also delete everything regarding this movies',
        onConfirm: () => {
          // this.organizationService.remove(this.orgId);
          this.snackBar.open('Movie deleted !', 'close', { duration: 5000 });
          this.router.navigate(['c/o/admin/panel/movies']);
        }
      }
    })
  }


  public async testWishlist(movieId: string) {
    const orgs = await    this.organizationService.getValue(ref => ref.where('wishlist', 'array-contains', movieId));

    console.log(orgs);

  }

}
