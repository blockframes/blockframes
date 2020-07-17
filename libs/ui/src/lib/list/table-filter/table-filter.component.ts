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
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { getValue } from '@blockframes/utils/helpers';
import { sortingDataAccessor, fallbackFilterPredicate } from '@blockframes/utils/table';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { ColRef } from '@blockframes/utils/directives/col-ref.directive';

@Component({
  selector: 'bf-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss'],
  host: { class: 'bf-table' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFilterComponent implements OnInit, AfterViewInit {
  @Input() @boolean showFilter: boolean;

  @Input() @boolean showPaginator: boolean;
  // Name of the column headers
  @Input() columns: Record<string, any>;
  @Input() initialColumns: string[];
  @Input() link: string;
  @Input() showLoader = false;
  @Input() pageSize = 10;
  @Input() filterPredicate: any;
  @Input() set source(data: any[]) {
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
  dataSource: MatTableDataSource<any>;

  // Filters
  columnFilter = new FormControl([]);
  public getValue = getValue;
  public noData = false;

  /** References to template to apply for specific columns */
  @ContentChildren(ColRef, { descendants: false }) cols: QueryList<ColRef>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.columnFilter.patchValue(this.initialColumns);
    this.displayedColumns$ = this.columnFilter.valueChanges.pipe(
      startWith(this.columnFilter.value)
    );

    setTimeout(() => {
      this.noData = true;
    }, 5000)
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Get the specific template provided by the parent component for a column if any
   * @param name This should be the name of the column you're looking the template for.
   */
  getTemplate(name: string): TemplateRef<any> {
    const col = this.cols.find(child => child.colRef === name);
    return col && col.template;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
