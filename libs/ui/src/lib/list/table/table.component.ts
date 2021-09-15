import { ChangeDetectionStrategy, Component, ContentChildren, Directive, Input, QueryList, TemplateRef } from '@angular/core';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap, tap } from 'rxjs/operators';
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';
import { FormControl } from '@angular/forms';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { Paginator } from './paginator';

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

  constructor(public template: TemplateRef<any>) {}

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
    <mat-form-field appearance="outline">
      <mat-label>Filter</mat-label>
      <input matInput [formControl]="control" />
    </mat-form-field>
  `,
  styles: [`
    :host { display: block; }
    mat-form-field { display: block; }
  `],
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
  selector: 'table[bfTable]',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  host: {
    class: 'mat-table',
    role: 'table'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent<T> {
  private dataSource = new BehaviorSubject<T[]>([]);
  private page = new BehaviorSubject(0);
  paginator = new Paginator();
  data$: Observable<T[]>;

  @ContentChildren(ColumnDirective) columns!: QueryList<ColumnDirective<T>>;
  @Input() filter?: TableFilterComponent<T>;
  @Input('bfTable') set source(source: T[]) {
    this.dataSource.next(source);
  }
  @Input() set pagination(amount: number | string) {
    const pageSize = coerceNumberProperty(amount);
    if (typeof pageSize === 'number') this.paginator.pageSize = pageSize;
  }

  constructor() {
    this.data$ = this.dataSource.asObservable().pipe(
      switchMap(data => this.filter ? this.filter.$filter(data, this.columns) : of(data)),
      switchMap(data => {
        const sorting = this.columns.filter(c => c.isSortable).map(column => column.$sort(data));
        if (!sorting.length) return of(data);
        return merge(...sorting).pipe(startWith(data)); // Prevent first merging to overfire
      }),
      switchMap(data => this.paginate(data)),
    );
  }


  ////////////////
  // Pagination //
  ////////////////

  private paginate(data: T[]) {
    this.paginator.size = data.length;
    if (this.paginator.pageIndex > this.paginator.maxIndex) this.paginator.last();
    return this.paginator.state.pipe(
      map(({ pageSize, pageIndex }) => {
        if (!pageSize) return data;
        return data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
      })
    );
  }
}