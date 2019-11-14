import { Component, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

// TODO issue#1146
import { AFM_DISABLE } from '@env';
import { OrganizationMember } from '../../member/+state';

@Component({
  selector: 'member-repertory',
  templateUrl: './member-repertory.component.html',
  styleUrls: ['./member-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberRepertoryComponent implements OnInit {

  @Input() set members(members: OrganizationMember[]) {
    this.dataSource = new MatTableDataSource(members);
    this.dataSource.sort = this.sort;
  }

  @Output() editing = new EventEmitter<string>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public AFM_DISABLE = AFM_DISABLE;

  public dataSource: MatTableDataSource<OrganizationMember>;
  // TODO issue#1146
/*   public displayedColumns: string[] = [ 'name', 'email', 'role', 'action' ]; */
public displayedColumns: string[] = [ 'name', 'email' ];

  // TODO issue#146
  ngOnInit() {
    if (AFM_DISABLE) {
      this.displayedColumns.push('signer');
    }
  }
}
