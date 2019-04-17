import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Stakeholder, StakeholderQuery, MovieQuery } from '@blockframes/movie';
import { DeliveryService, DeliveryQuery } from '../+state';
import { takeWhile } from 'rxjs/operators';
import { Router } from '@angular/router';

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
    private service : DeliveryService,
    private stakeholderQuery: StakeholderQuery,
    private router: Router,
    private movieQuery: MovieQuery,
    private query: DeliveryQuery,
  ) { }

  ngOnInit() {
    this.service.subscribeOnDeliveryStakeholders().pipe(takeWhile(() => this.isAlive)).subscribe();
    this.stakeholders$ = this.stakeholderQuery.selectAll();
  }

  public signDelivery() {
    this.service.signDelivery();
  }

  public navigateToSettings() {
    this.router.navigate([`${this.router.url}/settings`])
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

}
