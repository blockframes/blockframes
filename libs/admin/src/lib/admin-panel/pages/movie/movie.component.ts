import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieService, Movie } from '@blockframes/movie';
import { MovieAdminForm } from '../../forms/movie-admin.form';
import { staticModels } from '@blockframes/utils/static-model';
import { storeType, StoreStatus } from '@blockframes/movie/movie/+state/movie.firestore';


@Component({
  selector: 'admin-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieComponent implements OnInit {
  public movieId = '';
  private movie: Movie;
  public movieForm: MovieAdminForm;
  public storeTypes: string[];
  public storeType: any;
  public storeStatuses: string[];
  public storeStatus: any;
  public staticModels = staticModels;

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('movieId');
    this.movie = await this.movieService.getValue(this.movieId);
    this.movieForm = new MovieAdminForm(this.movie);

    this.storeTypes = Object.keys(storeType);
    this.storeType = storeType;
    this.storeStatuses = Object.keys(StoreStatus);
    this.storeStatus = StoreStatus;
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

    await this.movieService.updateById(this.movieId, this.movie);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

}
