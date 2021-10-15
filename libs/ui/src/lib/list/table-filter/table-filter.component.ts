import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  Input,
  AfterViewInit,
  Directive,
  TemplateRef,
  ContentChildren,
  QueryList,
  EventEmitter,
  Output,
  ContentChild,
  HostBinding,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { getValue } from '@blockframes/utils/helpers';
import { sortingDataAccessor, fallbackFilterPredicate } from '@blockframes/utils/table';
import { ColRefDirective } from '@blockframes/utils/directives/col-ref.directive';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Directive({ selector: '[colAction]' })
// eslint-disable-next-line
export class ColAction {
  @Input() label: string;
  @Input('colAction') ref: string;

  constructor(public template: TemplateRef<unknown>) {}
}

@Component({
  selector: 'bf-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFilterComponent implements OnInit, AfterViewInit {

  @HostBinding('class') class = 'bf-table';
  @Input() @boolean showFilter: boolean;
  @Input() @boolean showPaginator: boolean;
  @Input() @boolean clickable: boolean;

  // Name of the column headers
  @Input() columns: Record<string, string | { value: string, disableSort: boolean }>;
  @Input() initialColumns?: string[];
  @Input() link: string;
  @Input() showLoader = false;
  @Input() pageSize = 10;
  @Input() filterPredicate: (data: unknown, filter: string) => boolean;
  @Input() set source(data: unknown[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    if (this.filterPredicate) {
      this.dataSource.filterPredicate = this.filterPredicate;
    } else {
      this.dataSource.filterPredicate = fallbackFilterPredicate;
    }
    this.dataSource.sortingDataAccessor = sortingDataAccessor;
    this.dataSource.sort = this.sort;
  }

  @Output() rowClick = new EventEmitter();

  // Column & rows
  displayedColumns$: Observable<string[]>;
  dataSource: MatTableDataSource<unknown>;

  // Filters
  columnFilter = new FormControl([]);
  public getValue = getValue;
  public noData = false;

  /** References to template to apply for specific columns */
  @ContentChildren(ColRefDirective, { descendants: false }) cols: QueryList<ColRefDirective>;
  @ContentChild(ColAction) colAction?: ColAction;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    const initialColumns = this.initialColumns || Object.keys(this.columns);
    this.columnFilter.patchValue(initialColumns);
    this.displayedColumns$ = this.columnFilter.valueChanges.pipe(
      map(filter => {
        if (this.colAction) filter.push(this.colAction.ref)
        return filter
      }),
      map(col => col.sort((a, b) => initialColumns.indexOf(a) - initialColumns.indexOf(b))),
      startWith(this.columnFilter.value)
    );

    setTimeout(() => {
      this.noData = true;
    }, 5000);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  sortColumnDisabled(value: string | { value: string, disableSort: boolean }) {
    return typeof value === 'string' ? false : value.disableSort;
  }
}
