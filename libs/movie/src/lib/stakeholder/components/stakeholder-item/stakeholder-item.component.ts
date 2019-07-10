import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Stakeholder } from '../../+state';
import { Observable } from 'rxjs';
import { PermissionsQuery } from 'libs/organization/src/lib/permissions/+state';

@Component({
  selector: 'stakeholder-item',
  templateUrl: './stakeholder-item.component.html',
  styleUrls: ['./stakeholder-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderItemComponent implements OnInit {
  @Input() stakeholder: Stakeholder;
  @Output() removed = new EventEmitter();

  public isOrgAdmin$: Observable<boolean>;

  constructor(private permissionsQuery: PermissionsQuery) {}

  ngOnInit() {
    this.isOrgAdmin$= this.permissionsQuery.isOrgAdmin$;
  }
}
