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
import { BasketService } from '../../../distribution-right/+state/basket.service';

@Component({
  selector: 'catalog-wishlist-current-repertory',
  templateUrl: './wishlist-current-repertory.component.html',
  styleUrls: ['./wishlist-current-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistCurrentRepertoryComponent {

  @Output() sent = new EventEmitter();

  @Input() isCurrent = false;
  @Input() date: Date;

  public columnsToDisplay = [
    'movie',
    'salesAgent',
    'director',
    'productionStatus',
    'originCountry',
    'length'
  ];
  public dataSource: MatTableDataSource<Movie>;

  @Input()
  set movies(movies: Movie[]) {
    this.dataSource = new MatTableDataSource(movies);
    this.dataSource.sort = this.sort;
  }

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private router: Router,
    private service: BasketService
  ) {}

  ngOnInit() {
    if (this.isCurrent) {
      this.columnsToDisplay.push('delete');
    }
  }

  public getLabel(scope: Scope, slug: string) {
    return getLabelByCode(scope, slug);
  }

  // TODO: issue#1203 use a relative path
  public async redirectToMovie(movieId: string) {
    this.router.navigate([`layout/o/catalog/${movieId}/view`]);
  }

  public remove(movieId: string) {
    this.service.removeMovieFromWishlist(movieId);
  }
}
