import { Component, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { OrganizationMember } from '../../+state';

@Component({
  selector: 'member-repertory',
  templateUrl: './member-repertory.component.html',
  styleUrls: ['./member-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberRepertoryComponent {

  @Input() set members(members: OrganizationMember[]) {
    this.dataSource = new MatTableDataSource(members);
    this.dataSource.sort = this.sort;
  }

  @Output() editing = new EventEmitter<string>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public dataSource: MatTableDataSource<OrganizationMember>;
  public displayedColumns: string[] = ['name', 'email', 'role', 'action'];
}
