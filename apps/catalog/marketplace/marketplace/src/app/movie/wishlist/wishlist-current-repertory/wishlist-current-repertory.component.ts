import { MatTableDataSource, MatSort } from '@angular/material';
import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';
import { Movie } from '@blockframes/movie';
import { Router } from '@angular/router';
import { BasketService } from '../../../distribution-right/+state/basket.service';

@Component({
  selector: 'catalog-wishlist-current-repertory',
  templateUrl: './wishlist-current-repertory.component.html',
  styleUrls: ['./wishlist-current-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistCurrentRepertoryComponent implements OnInit {

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

  // TODO: issue#1203 use a relative path
  public async redirectToMovie(movieId: string) {
    this.router.navigate([`layout/o/catalog/${movieId}/view`]);
  }

  public remove(movieId: string) {
    this.service.removeMovieFromWishlist(movieId);
  }
}
