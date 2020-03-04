import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieService, Movie } from '@blockframes/movie';
import { MovieAdminForm } from '../../forms/movie-admin.form';
import { staticModels } from '@blockframes/utils/static-model';
import { DistributionDealService } from '@blockframes/movie/distribution-deals';
import { getValue } from '@blockframes/utils/helpers';
import { StoreStatus, storeType } from '@blockframes/movie/movie/+state/movie.firestore';

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
  public storeType = storeType;
  public storeStatus = StoreStatus;
  public staticModels = staticModels;
  public rows: any[] = [];

  public versionColumnsTable = {
    'id': 'Id',
    'status': 'Status',
    'contractId': 'Contract Id',
    'terms': 'Scope',
    'dealLink': 'Edit'
  };

  public initialColumnsTable: string[] = [
    'id',
    'status',
    'contractId',
    'terms',
    'dealLink',
  ];

  constructor(
    private movieService: MovieService,
    private distributionDealService: DistributionDealService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('movieId');
    this.movie = await this.movieService.getValue(this.movieId);
    this.movieForm = new MovieAdminForm(this.movie);

    const deals = await this.distributionDealService.getMovieDistributionDeals(this.movieId)
    this.rows = deals.map(d => ({ ...d, dealLink: { id: d.id, movieId: this.movieId } }));

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

  public getDealPath(dealId: string, movieId: string) {
    return `/c/o/admin/panel/deal/${dealId}/m/${movieId}`;
  }

  public getContractPath(contractId: string) {
    return `/c/o/admin/panel/contract/${contractId}`;
  }

}
