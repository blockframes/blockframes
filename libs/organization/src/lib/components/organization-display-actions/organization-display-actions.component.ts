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
  selector: 'org-display-actions',
  templateUrl: './organization-display-actions.component.html',
  styleUrls: ['./organization-display-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationDisplayActionsComponent implements OnInit {
  // The columns we want to display
  public displayedColumns: string[] = ['Icon', 'Document name', 'Signers'];

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
