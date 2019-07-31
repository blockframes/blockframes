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
import { OrganizationAction } from '../../+state';

@Component({
  selector: 'org-actions-table',
  templateUrl: './organization-actions-table.component.html',
  styleUrls: ['./organization-actions-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationActionsTableComponent implements OnInit {
  // The columns we want to display
  public displayedColumns: string[] = ['Document name', 'Signers'];

  public dataSource;

  @Input() isApproved: boolean;
  @Input() actions: OrganizationAction[];

  @Output() actionSelected = new EventEmitter<OrganizationAction>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit() {
    if (this.isApproved) this.displayedColumns.push('Date');
    this.dataSource = new MatTableDataSource<OrganizationAction>(this.actions);
    this.dataSource.sort = this.sort;
  }

  getAvatarList(action: OrganizationAction) {
    return action.signers.map(signer => signer.avatar);
  }
}
