import { ChangeDetectionStrategy, Component, ContentChildren, Directive, Input, QueryList } from '@angular/core';
import { BehaviorSubject, combineLatest, merge, Observable, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';
import { FormControl } from '@angular/forms';

/** Ascending sorting */
function sortValue<T>(a: T, b: T) {
  if (typeof a === 'string' && typeof b === 'string') return a.toUpperCase() > b.toUpperCase() ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return 0;
}

@Directive({ selector: '[colRef]' })
export class ColumnDirective<T> {
  control = new FormControl(true);

  @Input('colRef') name!: string;
  @Input() sortable: '' | boolean;
  @Input() label?: string;
  @Input() sort?: '' | ((a: any, b: any) => number);
  @Input() filter = (input: string, value: any, row: T) => {
    if (typeof value !== 'string') return false;
    return value.toLowerCase().includes(input);
  }

  constructor() {}

  get isSortable() {
    return this.sortable === '' || !!this.sortable;
  }

  get asc() {
    return this.control.value;
  }

  toggleSort() {
    this.control.setValue(!this.control.value);
  }

  $sort(data: T[]): Observable<T[]> {
    const sort = this.sort ? this.sort : sortValue;
    return this.control.valueChanges.pipe(
      map(asc => asc ? 1 : -1),
      map(order => data.sort((a, b) => sort(a, b) * order)),
      startWith(data),
    );
  }
}


/** Filter the table fields based on the input value */
function filterTable<T>(data: T[], value: string, columns: QueryList<ColumnDirective<T>>) {
  const input = value.toLowerCase();
  return data.filter(row => {
    return columns.some(column => {
      const value = getDeepValue(row, column.name);
      return column.filter(input, value, row);
    })
  });
}

@Component({
  selector: 'bf-table-filter',
  template: `
    <mat-form-field>
      <input matInput [formControl]="control" />
    </mat-form-field>
  `,
  styles: [],
  exportAs: 'bfTableFilter',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFilterComponent<T> {
  control = new FormControl();
  @Input() columns: string[];
  
  $filter(data: T[], columns: QueryList<ColumnDirective<T>>) {
    return this.control.valueChanges.pipe(
      debounceTime(200),
      map(value => filterTable(data, value, columns)),
      startWith(data),
    );
  }

}

@Component({
  selector: 'table [bfTable]',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent<T> {
  private dataSource = new BehaviorSubject<T[]>([]);
  data$: Observable<T[]>;

  @ContentChildren(ColumnDirective) columns!: QueryList<ColumnDirective<T>>;
  @Input() paginator: number = 0;
  @Input() filter?: TableFilterComponent<T>;
  @Input() set source(source: T[]) {
    this.dataSource.next(source);
  }

  constructor() {
    this.data$ = this.dataSource.asObservable().pipe(
      switchMap(data => this.filter ? this.filter.$filter(data, this.columns) : of(data)),
      switchMap(data => {
        const sorting = this.columns.filter(c => c.isSortable).map(column => column.$sort(data));
        return merge(...sorting);
      }),
      debounceTime(50),  // Prevent first merging to overfire
    );
  }
}