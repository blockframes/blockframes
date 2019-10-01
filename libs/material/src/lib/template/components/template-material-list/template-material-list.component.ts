import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, HostBinding } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MaterialTemplate } from '../../../material/+state';

@Component({
  selector: 'template-material-list',
  templateUrl: './template-material-list.component.html',
  styleUrls: ['./template-material-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateMaterialListComponent {
  @HostBinding('attr.page-id') pageId = 'template-material-list';
  @Input()
  set materials(materials: MaterialTemplate[]) {
    this.dataSource = new MatTableDataSource(materials);
    this.dataSource.sort = this.sort;
  }

  @Output() editing = new EventEmitter<string>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public dataSource: MatTableDataSource<MaterialTemplate>;
  public displayedColumns: string[] = ['value', 'description', 'category', 'price', 'action'];

}
