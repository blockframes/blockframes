import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { DeliveryService } from '../+state/delivery.service';

@Component({
  selector: 'delivery-view',
  templateUrl: './delivery-view.component.html',
  styleUrls: ['./delivery-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryViewComponent implements OnInit {
  public materials$: Observable<Object>;
  public progressionValue$: Observable<number>;

  constructor(private deliveryService: DeliveryService, private location: Location) {}

  ngOnInit() {
    this.materials$ = this.deliveryService.sortedDeliveryMaterials$;
    this.progressionValue$ = this.deliveryService.deliveryProgression$;
  }

  public goBack() {
    this.location.back();
  }
}
