import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieAdminForm, MovieAppAccessAdminForm } from '../../forms/movie-admin.form';
import { staticModels } from '@blockframes/utils/static-model';
import { DistributionRightService } from '@blockframes/distribution-rights/+state/distribution-right.service';
import { getValue } from '@blockframes/utils/helpers';
import { storeType, storeStatus } from '@blockframes/movie/+state/movie.firestore';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { app } from '@blockframes/utils/apps';

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
  public staticModels = staticModels;
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
    private distributionRightService: DistributionRightService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
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

    this.movie.main.storeConfig.status = this.movieForm.get('storeStatus').value;
    this.movie.main.storeConfig.storeType = this.movieForm.get('storeType').value;
    this.movie.main.status = this.movieForm.get('productionStatus').value;
    this.movie.main.internalRef = this.movieForm.get('internalRef').value;

    await this.movieService.updateById(this.movieId, this.movie);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  public async updateAppAccess() {
    if (this.movieAppAccessForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
    }

    this.movie.main.storeConfig.appAccess = this.movieAppAccessForm.value;

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


}
