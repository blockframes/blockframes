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

  public getStage(value: number) {
    // TODO: find a way to return a dynamic value to change the color property
    if (value > 0 && value <= 9) return 'red-number';
    if (value > 9 && value <= 29) return 'orange-number';
    if (value > 29 && value <= 49) return 'yellow-number';
    if (value > 49 && value <= 69) return 'green-number';
    if (value > 69 && value <= 89) return 'teal-number';
    if (value > 89 && value <= 100) return 'blue-number';
  }
}

