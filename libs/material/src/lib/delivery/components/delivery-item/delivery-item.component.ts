import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Delivery } from '../../+state/delivery.model';
import { Observable } from 'rxjs';

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
  public paymentIcon: string;
  public stakeholders: string;

  constructor() {}

  ngOnInit() {
    this.paymentIcon = this.delivery.isPaid ? 'payed' : 'notPayed';
    this.stakeholders = this.delivery.stakeholders.map(({ organization }) => organization.name).join(' | ');
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
}
