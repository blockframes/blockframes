import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';
import { Observable } from 'rxjs';
import { PermissionsQuery } from 'libs/organization/src/lib/permissions/+state';

@Component({
  selector: 'delivery-teamwork-item',
  templateUrl: './delivery-teamwork-item.component.html',
  styleUrls: ['./delivery-teamwork-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamworkItemComponent implements OnInit {
  @Input() stakeholder: Stakeholder;
  @Output() updated = new EventEmitter();
  @Output() removed = new EventEmitter();

  public isOrgAdmin$: Observable<boolean>;

  constructor(private permissionsQuery: PermissionsQuery) {}

  ngOnInit() {
    this.isOrgAdmin$ = this.permissionsQuery.isOrgAdmin$;
  }
}
