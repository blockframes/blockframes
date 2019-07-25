import {
  Component,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'org-action-item',
  templateUrl: './organization-action-item.component.html',
  styleUrls: ['./organization-action-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationActionItemComponent implements OnInit {
  // The columns we want to display
  public displayedColumns: string[] = ['Document name', 'Signers', 'Countersigners', 'Date'];

  public dataSource;

  // TODO #638: replace any
  @Input() actionItems: any;

  // TODO #638: replace any
  @Output() clickedOnSigners: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.actionItems);
    this.dataSource.sort = this.sort;
  }
}
