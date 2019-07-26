import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { OrganizationMember } from '../../+state';

@Component({
  selector: 'organization-member-repertory',
  templateUrl: './organization-member-repertory.component.html',
  styleUrls: ['./organization-member-repertory.component.scss']
})
export class OrganizationMemberRepertoryComponent implements OnInit {
  @Input() members: OrganizationMember[];
  @Output() editing = new EventEmitter();

  public dataSource: MatTableDataSource<OrganizationMember>;
  public displayedColumns: string[] = ['name', 'email', 'role', 'signer', 'action'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.members);
    this.dataSource.sort = this.sort;
  }
}
