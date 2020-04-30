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
import { createPrivateEventConfig } from '@blockframes/event/+state/event.model';
import { PrivateConfigForm } from '../../forms/private-config.form';
import { PrivateConfig } from '@blockframes/utils/common-interfaces';

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
  public privateConfigForm: PrivateConfigForm;
  public storeType = storeType;
  public storeStatus = storeStatus;
  public staticModels = staticModels;
  public rows: any[] = [];

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

    const privateConfig: false | PrivateConfig = await this.movieService.getMoviePrivateConfig(this.movieId)
      .then(c => c).catch(_ => false);
    this.privateConfigForm = new PrivateConfigForm(privateConfig || {});

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
      this.snackBar.open('Information not valid', 'close', { duration: 5000});
    }

    this.movie.main.storeConfig.appAccess.catalog = this.movieAppAccessForm.get('catalog').value;
    this.movie.main.storeConfig.appAccess.festival = this.movieAppAccessForm.get('festival').value;

    await this.movieService.updateById(this.movieId, this.movie);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  public async setMoviePrivateConfig() {
    if (this.privateConfigForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }
    const eventConfig = createPrivateEventConfig({ url: this.privateConfigForm.get('url').value });
    const callOutput = await this.movieService.setMoviePrivateConfig(this.movieId, eventConfig)
      .then(_ => true).catch(_ => false);
    if (callOutput) {
      this.snackBar.open('Information updated!', 'close', { duration: 5000 });
    } else {
      this.snackBar.open('Error while updating private config.', 'close', { duration: 5000 });
    }

  }

  public getMovieTunnelPath(movieId: string) {
    return `/c/o/dashboard/tunnel/movie/${movieId}`;
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

  public getRightPath(rightId: string, movieId: string) {
    return `/c/o/admin/panel/right/${rightId}/m/${movieId}`;
  }

  public getContractPath(contractId: string) {
    return `/c/o/admin/panel/contract/${contractId}`;
  }

}
