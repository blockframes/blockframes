import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization';

@Component({
  selector: 'festival-marketplace-organization-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {

  organizations$ = this.query.selectAll();
  
  constructor(private query: OrganizationQuery) { }

  ngOnInit(): void {
  }

}
