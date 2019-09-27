import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  HostBinding
} from '@angular/core';
import { Material, getMaterialStep } from '../../../material/+state';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Delivery } from '../../+state';
import { SelectionModel } from '@angular/cdk/collections';
import { deliveryActiveQuery } from '../../guards/delivery-active.guard';

@Component({
  selector: 'delivery-material-list',
  templateUrl: './delivery-material-list.component.html',
  styleUrls: ['./delivery-material-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryMaterialListComponent {
  @HostBinding('attr.page-id') pageId = 'delivery-material-list';
  @Input() delivery: Delivery;

  @Input()
  set materials(materials: Material[]) {
    // Add step with the stepId in materials
    materials = materials.map(material => getMaterialStep(material, this.delivery));
    this.dataSource = new MatTableDataSource(materials);
    this.dataSource.sort = this.sort;
  }

  @Input() displayedColumns: string[]

  @Output() editing = new EventEmitter<string>();
  @Output() selectedMaterial = new EventEmitter<Material>();
  @Output() selectAllMaterials = new EventEmitter<boolean>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public dataSource: MatTableDataSource<Material>;

  public selection = new SelectionModel<Material>(true, []);

  public selectMaterial(material: Material) {
    this.selectedMaterial.emit(material);
  }

  public selectAll() {
    this.selectAllMaterials.emit(!this.isAllSelected());
  }

  // TODO: Create a reusable table component for our lists => ISSUE#827
  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  public masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** Filtering function for the table. */
  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
