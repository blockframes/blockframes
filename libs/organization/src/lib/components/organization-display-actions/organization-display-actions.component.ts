import {
  Component,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
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
export class OrganizationDisplayActionsComponent {
  // The columns we want to display
  public displayedColumns: string[] = ['Icon', 'Document name', 'Signers'];

  public dataSource;

  @Input() set isApproved(isApproved: boolean) {
    if (this.isApproved) this.displayedColumns.push('Date');
  }

  @Input() set actions(actions: OrganizationAction[]) {
    this.dataSource = new MatTableDataSource(actions);
    this.dataSource.sort = this.sort;
  }

  @Output() actionSelected = new EventEmitter<OrganizationAction>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;


  getAvatarList(action: OrganizationAction) {
    return action.signers.map(signer => signer.avatar);
  }
}
