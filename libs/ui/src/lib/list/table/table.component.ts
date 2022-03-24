import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Directive, EventEmitter, HostBinding, Input, OnDestroy, Output, QueryList, TemplateRef } from '@angular/core';
import { BehaviorSubject, merge, Observable, of, Subscription } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';
import { FormControl } from '@angular/forms';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { Paginator, PageState } from './paginator';
import { removeAccent } from '@blockframes/utils/utils';

/** Ascending sorting */
function sortValue<T>(a: T, b: T) {
  if (typeof a === 'string' && typeof b === 'string') return a.toUpperCase() > b.toUpperCase() ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    if (a && b) return 0;
    return a ? 1 : -1;
  }
  return 0;
}


/** Filter the table fields based on the input value */
function filterTable<T>(data: T[], value: string, columns: QueryList<ColumnDirective<T>>) {
  const input = removeAccent(value.toLowerCase());
  return data.filter(row => {
    return columns.some(column => {
      const value = removeAccent(getDeepValue(row, column.name));
      return column.filter(input, value, row);
    })
  });
}

@Directive({ selector: '[colRef]' })
export class ColumnDirective<T> {
  control = new FormControl(true);

  /** Path of the value in the row */
  @Input('colRef') name!: string;

  /** Text to display in the column header. Header will fallback to colRef value if not provided */
  @Input() label?: string;

  /** Specify if the column is sticky. Only first & last column can be sticky */
  @Input() @boolean sticky = false;

  /** If set to true, the data will be sorted with this column. There should be max one defaultSort column */
  @Input() @boolean defaultSort: boolean;

  /** Does the column support sorting. If a function is provided, the function is used to sort the column */
  @Input() sort?: '' | ((a: any, b: any) => number);

  /** A custom function to filter the column. `useFilter` should be set on the `bf-table` */
  @Input() filter = (input: string, value: any, row: T) => {
    if (typeof value !== 'string') return false;
    return value.toLowerCase().includes(input);
  }

  constructor(public template: TemplateRef<any>) { }

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
export class TableComponent<T> implements AfterContentInit, OnDestroy {
  private dataSource = new BehaviorSubject<T[]>([]);
  search = new FormControl();
  paginator = new Paginator({
    onChange: (page) => this.page.emit(page)
  });
  data$: Observable<T[]>;


  @ContentChildren(ColumnDirective) columns!: QueryList<ColumnDirective<T>>;

  /** If true, each line is clickable. Listen on (rowClick) output to get the click event */
  @HostBinding('class.clickable') @Input() @boolean clickable: boolean;

  /** Display the filter input above table */
  @Input() @boolean useFilter: boolean;

  /** The content to display in the table */
  @Input() set source(source: T[]) {
    this.dataSource.next(source ?? []);
  }
  /** Amount of item per page. If not set, paginator will be disabled */
  @Input() set pagination(amount: number | string) {
    const pageSize = coerceNumberProperty(amount);
    if (typeof pageSize === 'number') this.paginator.pageSize = pageSize;
  }

  /** Emits the content of the row when clicked. Requires input "clickable" to be set  */
  @Output() rowClick = new EventEmitter<T>();
  @Output() page = new EventEmitter<PageState>();

  private sub: Subscription;

  constructor(private cdr: ChangeDetectorRef) {
    this.data$ = this.dataSource.asObservable().pipe(
      switchMap(data => this.$filter(data)),
      switchMap(data => this.$sort(data)),
      switchMap(data => this.$paginate(data)),
    );
  }

  ngAfterContentInit() {
    // Update component in case *ngIf is used in the ng-template of one of the columns
    this.sub = this.columns.changes.subscribe(_ => this.cdr.markForCheck());
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
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
    return merge(...sorting).pipe(startWith(data));
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
