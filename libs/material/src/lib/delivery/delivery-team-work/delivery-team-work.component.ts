import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryService } from '../+state';
import { Stakeholder, StakeholderService, StakeholderQuery } from '@blockframes/movie';
import { staticModels } from '@blockframes/movie';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'delivery-team-work',
  templateUrl: './delivery-team-work.component.html',
  styleUrls: ['./delivery-team-work.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamWorkComponent implements OnInit, OnDestroy {
  public movieStakeholders$: Observable<Stakeholder[]>;
  public authorizations: Object;
  public deliveryStakeholders$: Observable<Stakeholder[]>;
  public isAlive = true;

  constructor(
    private stakeholderService: StakeholderService,
    private service: DeliveryService,
    private stakeholderQuery: StakeholderQuery,
  ) {}

  ngOnInit() {
    this.service.subscribeOnDeliveryStakeholders().pipe(takeWhile(() => this.isAlive)).subscribe();

    this.deliveryStakeholders$ = this.stakeholderQuery.selectAll();
    this.movieStakeholders$ = this.stakeholderService.stakeholdersByMovie$;
    this.authorizations = staticModels.STAKEHOLDER_DELIVERY_AUTHORIZATIONS;
  }

  public addStakeholder(movieStakeholder: Stakeholder, authorization: string) {
    this.service.addStakeholder(movieStakeholder, authorization);
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
