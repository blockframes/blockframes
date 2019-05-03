import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Stakeholder, StakeholderQuery, MovieQuery } from '@blockframes/movie';
import { DeliveryService, DeliveryQuery } from '../+state';
import { takeWhile } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DeliverySignComponent } from '../delivery-sign/delivery-sign.component';

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
    private dialog: MatDialog,
    private movieQuery: MovieQuery,
    private query: DeliveryQuery,
  ) { }

  ngOnInit() {
    this.service.subscribeOnDeliveryStakeholders().pipe(takeWhile(() => this.isAlive)).subscribe();
    this.stakeholders$ = this.stakeholderQuery.selectAll();
  }

  public openSignDelivery() {
    this.dialog.open(DeliverySignComponent, {
      width: '600px',
      data: {
        onConfirm: () => this.signDelivery()
      }
    });
  }

  public signDelivery() {
    this.service.signDelivery();
  }


  public navigateToTeamwork() {
    this.router.navigate([`${this.router.url}/teamwork`])
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

}
