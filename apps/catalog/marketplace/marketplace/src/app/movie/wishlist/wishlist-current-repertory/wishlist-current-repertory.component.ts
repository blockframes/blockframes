import { MatTableDataSource, MatSort } from '@angular/material';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Subscription } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MovieData } from '../../../distribution-right/+state';
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
  dataSource: MatTableDataSource<Movie>;
  selection = new SelectionModel<MovieData>(true, []);

  @Input()
  set movies(movies: Movie[]) {
    this.dataSource = new MatTableDataSource(movies);
    this.dataSource.sort = this.sort;
  }

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor() {}

  public getLabel(scope: Scope, slug: string) {
    return getLabelByCode(scope, slug);
  }
}
