import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Stakeholder } from '@blockframes/movie';
import { DeliveryQuery, DeliveryService } from '../+state';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'delivery-stakeholder-list',
  templateUrl: './stakeholder-list.component.html',
  styleUrls: ['./stakeholder-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderListComponent implements OnInit, OnDestroy {

  public stakeholders$: Observable<Stakeholder[]>;
  private isAlive = true;

  constructor(
    private query: DeliveryQuery,
    private service : DeliveryService,
  ) { }

  ngOnInit() {
    this.service.subscribeOnDeliveryStakeholders().pipe(takeWhile(() => this.isAlive)).subscribe();
    this.stakeholders$ = this.query.selectActive(entity => entity.stakeholders);
  }

  public signDelivery() {
    this.service.signDelivery();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

}
