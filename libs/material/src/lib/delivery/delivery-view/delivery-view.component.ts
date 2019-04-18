import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { DeliveryQuery, DeliveryService } from '../+state';


@Component({
  selector: 'delivery-view',
  templateUrl: './delivery-view.component.html',
  styleUrls: ['./delivery-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryViewComponent implements OnInit {
  public materials$: Observable<Object>;
  public progressionValue$: Observable<number>;

  constructor(
    private query: DeliveryQuery,
    private service: DeliveryService,
    private location: Location,
  ) {}

  ngOnInit() {
    this.materials$ = this.query.materialsByActiveDelivery$;
    this.progressionValue$ = this.query.deliveryProgression$;
  }

  public goBack() {
    this.location.back();
  }
}
