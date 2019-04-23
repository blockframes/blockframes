import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
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

  // Visual bullshit for WoW effect
  public stateIcons = ['dummy', 'accepted', 'available', 'delivered', 'pending', 'refused'];
  public paymentIcons = ['dummy', 'payed', 'not_payed'];
  public stateIcon: string;
  public paymentIcon: string;

  constructor(
    private query: DeliveryQuery,
  ) {}

  ngOnInit() {
    this.stateIcon = this.stateIcons[this.randomNumberPicker(5)];
    this.paymentIcon = this.paymentIcons[this.randomNumberPicker(2)];
  }

  public selectDelivery() {
    this.isSelected.emit(true);
  }

  public getRandomColor() {
    return '#000000'.replace(/0/g, function() {
// tslint:disable-next-line: no-bitwise
      return (~~(Math.random() * 16)).toString(16);
    });
  }

  public randomNumberPicker(scale: number) {
    return Math.floor(Math.random() * scale) + 1;
  }
}
