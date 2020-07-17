// Angular
import {
  Component,
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
  AfterContentInit,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { getValue } from '@blockframes/utils/helpers';
import { FormList } from '@blockframes/utils/form';

/**
 * This directive is to be used inside the table-filter component on a ng-template
 * @example `<ng-template colRef="director" let-director> {{ director.firstName }}</ng-template>`
 * @dev Use the name of the column in colRef & let-[name here]
 */
@Directive({ selector: '[colRef]' })
// tslint:disable-next-line: directive-class-suffix
export class ColRef {
  /** This should be the name of the column this template will be used into. */
  @Input() colRef: string;
  constructor(public template: TemplateRef<any>) { }
}

@Component({
  selector: 'bf-form-list-table',
  templateUrl: './form-list-table.component.html',
  styleUrls: ['./form-list-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormListTableComponent implements  AfterContentInit, AfterViewInit {

  @Input() @boolean showPaginator: boolean;

  // Name of the column headers
  @Input() displayedColumns: string[];
  @Input() pageSize = 10;
  @Input() set source(data: FormList<any>) {
    this.dataSource = new MatTableDataSource([data.value]);
  }

  @Output() rowClick = new EventEmitter();

  // Column & rows  
  dataSource: MatTableDataSource<any>;

  public getValue = getValue;

  /** References to template to apply for specific columns */
  @ContentChildren(ColRef, { descendants: false }) cols: QueryList<ColRef>;
/*   @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort; */

  ngAfterContentInit() {
    console.log(this.cols)
  }

  ngAfterViewInit() {
    console.log(this.cols)
    /*     this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort; */
  }

  /**
   * Get the specific template provided by the parent component for a column if any
   * @param name This should be the name of the column you're looking the template for.
   */
  getTemplate(name: string): TemplateRef<any> {
    const col = this.cols.find(child => child.colRef === name);
    return col && col.template;
  }
}
