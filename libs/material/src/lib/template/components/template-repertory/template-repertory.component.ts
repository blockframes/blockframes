import { ChangeDetectionStrategy, Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Template } from '../../+state';

@Component({
  selector: 'template-repertory',
  templateUrl: './template-repertory.component.html',
  styleUrls: ['./template-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateRepertoryComponent {
  @Input()
  set templates(templates: Template[]) {
    this.dataSource = new MatTableDataSource(templates);
    this.dataSource.sort = this.sort;
  }

  @Output() delete = new EventEmitter<Template>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public dataSource: MatTableDataSource<Template>;
  public displayedColumns: string[] = ['name', 'created', 'action'];
}
