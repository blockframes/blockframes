import {
  Component,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'org-activity-repertory',
  templateUrl: './organization-activity-repertory.component.html',
  styleUrls: ['./organization-activity-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationActivityRepertoryComponent implements OnInit {
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
