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
import { SelectionModel } from '@angular/cdk/collections';

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
  @Output() selectedMaterial = new EventEmitter<Material>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public dataSource: MatTableDataSource<Material>;
  public displayedColumns: string[] = [
    'select',
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

  public selection = new SelectionModel<Material>(true, []);

  public selectMaterial(material: Material, event: Event) {
    event.stopPropagation();
    this.selectedMaterial.emit(material)
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
}
