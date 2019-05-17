import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryService, DeliveryQuery, Delivery } from '../+state';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DeliverySignComponent } from '../delivery-sign/delivery-sign.component';

@Component({
  selector: 'delivery-stakeholder-list',
  templateUrl: './stakeholder-list.component.html',
  styleUrls: ['./stakeholder-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderListComponent implements OnInit {

  public delivery$: Observable<Delivery>;

  constructor(
    private service : DeliveryService,
    private router: Router,
    private dialog: MatDialog,
    private query: DeliveryQuery,
  ) { }

  ngOnInit() {
    this.delivery$ = this.query.selectActive();
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

}
