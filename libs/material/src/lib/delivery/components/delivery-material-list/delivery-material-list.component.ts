import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  HostBinding,
  OnInit
} from '@angular/core';
import { Material, getMaterialStep } from '../../../material/+state';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Delivery, DeliveryQuery } from '../../+state';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable } from 'rxjs';

@Component({
  selector: 'delivery-material-list',
  templateUrl: './delivery-material-list.component.html',
  styleUrls: ['./delivery-material-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryMaterialListComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'delivery-material-list';

  @Input()
  set materials(materials: Material[]) {
    materials = materials.map(material => getMaterialStep(material, this.deliveryQuery.getActive()));
    this.dataSource = new MatTableDataSource(materials);
    this.dataSource.sort = this.sort;
  }

  @Output() editing = new EventEmitter<string>();
  @Output() selectedMaterial = new EventEmitter<Material>();
  @Output() selectAllMaterials = new EventEmitter<boolean>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public dataSource: MatTableDataSource<Material>;
  public selection = new SelectionModel<Material>(true, []);
  public delivery$: Observable<Delivery>;
  public displayedColumns: string[] = this.setDisplayedColumns();

  constructor(private deliveryQuery: DeliveryQuery) {}

  ngOnInit() {
    this.delivery$ = this.deliveryQuery.selectActive();
  }

  /* Define an array of columns to be displayed in the list depending on delivery settings **/
  public setDisplayedColumns(): string[] {
    return this.deliveryQuery.getActive().mustChargeMaterials
      ? ['select', 'value', 'description', 'step', 'category', 'price', 'isOrdered', 'isPaid', 'status', 'action']
      : ['select', 'value', 'description', 'step', 'category', 'status', 'action'];
  }

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
