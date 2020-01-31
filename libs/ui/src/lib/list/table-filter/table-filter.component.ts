import { Component, OnInit, ChangeDetectionStrategy, ViewChild, Input, AfterViewInit, Directive, TemplateRef, ContentChildren, QueryList } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';

/**
 * This directive is to be used inside the table-filter component on a ng-template
 * @example `<ng-template colRef="director" let-director> {{ director.firstName }}</ng-template>`
 * @dev Use the name of the column in colRef & let-[name here]
 */
@Directive({ selector: '[colRef]' })
// tslint:disable-next-line: directive-class-suffix
export class ColRef  {
  /** This should be the name of the column this template will be used into. */
  @Input() colRef: string;
  constructor(public template: TemplateRef<any>) {}
}




@Component({
  selector: 'bf-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFilterComponent implements OnInit, AfterViewInit {

  @Input() showFilter = false;
  @Input() showPaginator = false;
  @Input() columns: Record<string, any>;
  @Input() initialColumns: string[];
  @Input() link: string;
  @Input() set source(data: any[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  // Column & rows
  displayedColumns$: Observable<string[]>;
  dataSource: MatTableDataSource<any>;

  // Filters
  columnFilter = new FormControl([]);

  /** References to template to apply for specific columns */
  @ContentChildren(ColRef, {descendants: false}) cols: QueryList<ColRef>;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  ngOnInit() {
    this.columnFilter.patchValue(this.initialColumns);
    this.displayedColumns$ = this.columnFilter.valueChanges.pipe(
      startWith(this.columnFilter.value)
    );
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
    const col = this.cols.find(child => child.colRef === name)
    return col && col.template;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Get the value of an item based on a path
   * @example item = movie, key = 'budget.totalBudget'
   */
  getValue(item: any, key: string) {
    const path = key.split('.');
    for (let i=0; i < path.length; i++) {
      item = item[path[i]];
    };
    return item;
  }
}
