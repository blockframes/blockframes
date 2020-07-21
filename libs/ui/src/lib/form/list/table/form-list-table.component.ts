// Angular
import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  Input,
  AfterViewInit,
  ContentChildren,
  QueryList
} from '@angular/core';

// Material
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

// Blockframes
import { boolean } from '@blockframes/utils/decorators/decorators';
import { ColRef } from '@blockframes/utils/directives/col-ref.directive';


// RxJs
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: '[displayedColumns] [dataSource] bf-form-list-table',
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
  set dataSource(data) {
    this._dataSource = new MatTableDataSource(data);
  }

  selectedRow = new BehaviorSubject<number>(null)
  removeIndex = new BehaviorSubject<number>(null)

  /** References to template to apply for specific columns */
  @ContentChildren(ColRef, { descendants: false }) cols: QueryList<ColRef>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this._dataSource.paginator = this.paginator;
    this.displayedColumns.push('actions')
  }

  removeEntity(index: number) {
    if (index || index === 0) {
      this.removeIndex.next(index);
      this._dataSource.data.splice(index, 1);
      this.reconnectPaginator();
      this._dataSource._updateChangeSubscription();
    }
  }

  reconnectPaginator() {
    if (this.paginator) {
      this._dataSource.paginator = this.paginator
      this.paginator._changePageSize(this.paginator.pageSize);
    }
  }
}
