// Angular
import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  Input,
  AfterViewInit,
  ContentChildren,
  QueryList,
  EventEmitter,
  Output
} from '@angular/core';

// Material
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

// Blockframes
import { boolean } from '@blockframes/utils/decorators/decorators';
import { FormList } from '@blockframes/utils/form';
import { ColRef } from '@blockframes/utils/directives/col-ref.directive';

@Component({
  selector: 'bf-form-list-table',
  templateUrl: './form-list-table.component.html',
  styleUrls: ['./form-list-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormListTableComponent implements AfterViewInit {

  @Input() @boolean showPaginator: boolean;

  // Name of the column headers
  @Input() displayedColumns: string[] = [];
  @Input() pageSize = 10;

  private _dataSource: MatTableDataSource<any>
  @Input()
  get dataSource() { return this._dataSource as any }
  set dataSource(data: FormList<any>) {
    this._dataSource = new MatTableDataSource(data.value);
  }

  @Output() rowClick = new EventEmitter();

  /** References to template to apply for specific columns */
  @ContentChildren(ColRef, { descendants: false }) cols: QueryList<ColRef>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this._dataSource.paginator = this.paginator;
    this._dataSource.sort = this.sort;
    this.displayedColumns.push('actions')
    console.log(this.dataSource)
  }
}
