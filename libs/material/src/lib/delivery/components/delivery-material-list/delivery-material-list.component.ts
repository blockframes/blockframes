import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { Material } from '../../../material/+state';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Delivery } from '../../+state';

@Component({
  selector: 'delivery-material-list',
  templateUrl: './delivery-material-list.component.html',
  styleUrls: ['./delivery-material-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryMaterialListComponent {
  @Input()
  set materials(materials: Material[]) {
    this.dataSource = new MatTableDataSource(materials);
    this.dataSource.sort = this.sort;
  }

  @Input() delivery: Delivery;

  @Output() editing = new EventEmitter<string>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public dataSource: MatTableDataSource<Material>;
  public displayedColumns: string[] = [
    'value',
    'description',
    'step',
    'category',
    'price',
    'isOrdered',
    'isPaid',
    'status',
    'action'
  ];
}
