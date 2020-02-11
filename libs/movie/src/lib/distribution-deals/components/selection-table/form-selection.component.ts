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
import { DateRange } from '@blockframes/utils/common-interfaces/range';

/**
 * @TODO (#1388) should be removed to use something more like actual movie model
 */
export interface MovieData {
  id: string;
  movieName: string;
  duration: DateRange;
  territory: string;
  rights: string;
  languages: string;
  dubbed: string;
  subtitle: string;
}

@Component({
  selector: 'catalog-form-selection',
  templateUrl: './form-selection.component.html',
  styleUrls: ['./form-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogFormSelectionComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  columnsToDisplay = [
    'checkBox',
    'movieName',
    'endRights',
    'territory',
    'rights',
    'languages',
    'dubbed',
    'subtitle',
    'delete'
  ];
  dataSource: MatTableDataSource<MovieData>;
  selection = new SelectionModel<MovieData>(true, []);

  @Input()
  set selectedMovieDetail(movieData: MovieData[]) {
    this.dataSource = new MatTableDataSource(movieData);
    this.dataSource.sort = this.sort;
  }

  @Output() delete = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<MovieData[]>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor() {}

  ngOnInit() {
    // We listen on the change of selection and forward it to the parent
    this.subscription = this.selection.changed.subscribe(() =>
      this.selectionChange.emit(this.selection.selected)
    );
  }

  public remove(movie: MovieData) {
    this.selection.deselect(movie);
    this.delete.emit(movie.id);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  get isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  public masterToggle() {
    this.isAllSelected
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  public toggle(element: MovieData) {
    this.selection.toggle(element);
  }

  ngOnDestroy() {
    // We stop listening when component is destroyed
    this.subscription.unsubscribe();
  }
}
