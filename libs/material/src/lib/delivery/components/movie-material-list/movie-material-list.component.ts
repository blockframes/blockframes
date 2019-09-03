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

@Component({
  selector: 'movie-material-list',
  templateUrl: './movie-material-list.component.html',
  styleUrls: ['./movie-material-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieMaterialListComponent {
  @Input()
  set materials(materials: Material[]) {
    this.dataSource = new MatTableDataSource(materials);
    this.dataSource.sort = this.sort;
  }

  @Output() editing = new EventEmitter<string>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public dataSource: MatTableDataSource<Material>;
  public displayedColumns: string[] = [
    'value',
    'description',
    'category',
    'price',
    'owner',
    'storage',
    'action'
  ];

  /** Filtering function for the table. */
  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
