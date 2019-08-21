import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Material } from '../../../material/+state';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'delivery-movie-material-list',
  templateUrl: './delivery-movie-material-list.component.html',
  styleUrls: ['./delivery-movie-material-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryMovieMaterialListComponent {
  @Input()
  set materials(materials: Material[]) {
    this.dataSource = new MatTableDataSource(materials);
    this.dataSource.sort = this.sort;
  }

  @Output() editing = new EventEmitter<string>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public dataSource: MatTableDataSource<Material>;
  public displayedColumns: string[] = ['title', 'description', 'step', 'price', 'owner', 'storage', 'action'];

}
