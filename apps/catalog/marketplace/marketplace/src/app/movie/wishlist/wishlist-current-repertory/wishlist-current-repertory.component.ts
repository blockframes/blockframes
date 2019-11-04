import { MatTableDataSource, MatSort } from '@angular/material';
import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { Movie } from '@blockframes/movie';
import { getLabelByCode, Scope } from '@blockframes/movie/movie/static-model/staticModels';

@Component({
  selector: 'catalog-wishlist-current-repertory',
  templateUrl: './wishlist-current-repertory.component.html',
  styleUrls: ['./wishlist-current-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistCurrentRepertoryComponent {

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

  public getLabel(scope: Scope, slug: string) {
    return getLabelByCode(scope, slug);
  }
}
