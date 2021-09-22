import { ChangeDetectionStrategy, Component, ContentChildren, Directive, EventEmitter, HostBinding, Input, Output, QueryList, TemplateRef } from '@angular/core';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';
import { FormControl } from '@angular/forms';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { Paginator } from './paginator';

/** Ascending sorting */
function sortValue<T>(a: T, b: T) {
  if (typeof a === 'string' && typeof b === 'string') return a.toUpperCase() > b.toUpperCase() ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return 0;
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

@Directive({ selector: '[colRef]' })
export class ColumnDirective<T> {
  control = new FormControl(true);

  @Input('colRef') name!: string;
  @Input() label?: string;
  @Input() @boolean sticky = false;
  @Input() @boolean defaultSort: boolean;
  @Input() sort?: '' | ((a: any, b: any) => number);
  @Input() filter = (input: string, value: any, row: T) => {
    if (typeof value !== 'string') return false;
    return value.toLowerCase().includes(input);
  }

  constructor(public template: TemplateRef<any>) {}

  get isSortable() {
    return this.sort === '' || !!this.sort;
  }

  get asc() {
    return this.control.value;
  }

  toggleSort() {
    this.control.setValue(!this.control.value);
  }

  $sort(data: T[]): Observable<T[]> {
    const sort = this.sort || sortValue;
    const value$ = this.defaultSort
      ? this.control.valueChanges.pipe(startWith(this.control.value))
      : this.control.valueChanges;
    return value$.pipe(
      map(asc => asc ? 1 : -1),
      map(order => data.sort((a, b) => {
        const sorting = sort(getDeepValue(a, this.name), getDeepValue(b, this.name));
        return sorting * order;
      })),
    );
  }
}


@Component({
  selector: 'bf-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  host: {
    class: 'surface',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent<T> {
  private dataSource = new BehaviorSubject<T[]>([]);
  search = new FormControl();
  paginator = new Paginator();
  data$: Observable<T[]>;
  

  @ContentChildren(ColumnDirective) columns!: QueryList<ColumnDirective<T>>;
  @HostBinding('class.clickable') @Input() @boolean clickable: boolean;
  @Input() @boolean useFilter: boolean;
  @Input() set source(source: T[]) {
    this.dataSource.next(source);
  }
  @Input() set pagination(amount: number | string) {
    const pageSize = coerceNumberProperty(amount);
    if (typeof pageSize === 'number') this.paginator.pageSize = pageSize;
  }

  @Output() rowClick = new EventEmitter<T>();

  constructor() {
    this.data$ = this.dataSource.asObservable().pipe(
      switchMap(data => this.$filter(data)),
      switchMap(data => this.$sort(data)),
      switchMap(data => this.$paginate(data)),
    );
  }

  private $paginate(data: T[]) {
    this.paginator.size = data.length;
    if (this.paginator.pageIndex > this.paginator.maxIndex) this.paginator.last();
    return this.paginator.state.pipe(
      map(({ pageSize, pageIndex }) => {
        if (!pageSize) return data;
        return data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
      })
    );
  }

  private $sort(data: T[]) {
    const sorting = this.columns.filter(c => c.isSortable).map(column => column.$sort(data));
    if (!sorting.length) return of(data);
    return merge(...sorting).pipe(startWith(data)); // Prevent first merging to overfire
  }

  private $filter(data: T[]) {
    if (!this.useFilter) return of(data);
    return this.search.valueChanges.pipe(
      debounceTime(200),
      map(value => filterTable(data, value, this.columns)),
      startWith(data),
    );
  }
}