import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryQuery, Delivery, DeliveryService } from '../../+state';
import { Stakeholder, MovieQuery, Movie } from '@blockframes/movie';
import { PermissionsQuery } from 'libs/organization/src/lib/permissions/+state';

@Component({
  selector: 'delivery-teamwork-editable',
  templateUrl: './delivery-teamwork-editable.component.html',
  styleUrls: ['./delivery-teamwork-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamworkEditableComponent implements OnInit {
  public delivery$: Observable<Delivery>;
  public movie$: Observable<Movie>;
  public stakeholderId: string;
  public isOrgAdmin$: Observable<boolean>;

  constructor(
    private movieQuery: MovieQuery,
    private deliveryQuery: DeliveryQuery,
    private service: DeliveryService,
    private permissionsQuery: PermissionsQuery,
  ) {}

  ngOnInit() {
    this.delivery$ = this.deliveryQuery.selectActive();
    this.movie$ = this.movieQuery.selectActive();
    this.isOrgAdmin$ = this.permissionsQuery.isOrgAdmin$;
    this.isOrgAdmin$.subscribe(x => console.log(x))
  }

  public addStakeholder(stakeholder: Stakeholder) {
    this.service.addStakeholder(stakeholder);
  }

  public removeStakeholder(stakeholderId: string) {
    this.service.removeStakeholder(stakeholderId);
  }

  public openForm(stakeholder: Stakeholder) {
    this.stakeholderId = stakeholder.id;
  }

  public cancelForm() {
    delete this.stakeholderId;
  }

}
