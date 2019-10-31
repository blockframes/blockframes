import { MatTableDataSource, MatSort } from '@angular/material';
import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Movie } from '@blockframes/movie';
import { getLabelByCode, Scope } from '@blockframes/movie/movie/static-model/staticModels';
import { Router } from '@angular/router';

@Component({
  selector: 'catalog-wishlist-current-repertory',
  templateUrl: './wishlist-current-repertory.component.html',
  styleUrls: ['./wishlist-current-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistCurrentRepertoryComponent {

  @Output() sent = new EventEmitter();

  public columnsToDisplay = [
    'movie',
    'salesAgent',
    'director',
    'productionStatus',
    'originCountry',
    'length',
    'delete'
  ];
  public dataSource: MatTableDataSource<Movie>;

  @Input()
  set movies(movies: Movie[]) {
    this.dataSource = new MatTableDataSource(movies);
    this.dataSource.sort = this.sort;
  }

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private router: Router) {}

  public getLabel(scope: Scope, slug: string) {
    return getLabelByCode(scope, slug);
  }

  public async redirectToMovie(movieId: string) {
    this.router.navigateByUrl(`layout/o/catalog/${movieId}/view`);
  }

  public remove(movie: Movie) {
    // TODO: user Max update function
  }
}
