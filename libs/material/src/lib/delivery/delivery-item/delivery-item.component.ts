import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Delivery } from '../+state/delivery.model';
import { Observable } from 'rxjs';
import { DeliveryQuery } from '../+state';

@Component({
  selector: 'delivery-item',
  templateUrl: './delivery-item.component.html',
  styleUrls: ['./delivery-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryItemComponent implements OnInit {

  @Input() delivery: Delivery;
  @Output() isSelected = new EventEmitter<boolean>();

  public progression$: Observable<number>;

  constructor(private query: DeliveryQuery) { }

  ngOnInit() {
    this.progression$ = this.query.deliveryProgressionById(this.delivery.id);
  }

  public selectDelivery() {
    this.isSelected.emit(true);
  }
}
