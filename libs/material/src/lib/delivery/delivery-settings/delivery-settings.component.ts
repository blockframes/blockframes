import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryQuery, DeliveryService } from '../+state';
import { Stakeholder, StakeholderService } from '@blockframes/movie';
import { staticModels } from '@blockframes/movie';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'delivery-settings',
  templateUrl: './delivery-settings.component.html',
  styleUrls: ['./delivery-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliverySettingsComponent implements OnInit, OnDestroy {
  public movieStakeholders$: Observable<Stakeholder[]>;
  public authorizations: Object;
  public deliveryStakeholders$: Observable<Stakeholder[]>;
  public isAlive = true;

  constructor(
    private query: DeliveryQuery,
    private stakeholderService: StakeholderService,
    private service: DeliveryService,
  ) {}

  ngOnInit() {
    this.service.subscribeOnDeliveryStakeholders().pipe(takeWhile(() => this.isAlive)).subscribe();
    this.deliveryStakeholders$ = this.query.selectActive(delivery => delivery.stakeholders);

    this.movieStakeholders$ = this.stakeholderService.stakeholdersByActiveMovie$;

    this.authorizations = staticModels.STAKEHOLDER_DELIVERY_AUTHORIZATIONS;
  }

  public addStakeholder(movieStakeholder: Stakeholder, authorization: string) {
    this.service.addStakeholder(movieStakeholder, authorization);
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
