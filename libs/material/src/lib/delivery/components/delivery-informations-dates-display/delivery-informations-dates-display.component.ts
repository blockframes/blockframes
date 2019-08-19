import {
  Component,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { Delivery } from '../../+state';

@Component({
  selector: 'delivery-informations-dates-display',
  templateUrl: './delivery-informations-dates-display.component.html',
  styleUrls: ['./delivery-informations-dates-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsDatesDisplayComponent {
  @Input() delivery: Delivery;
  @Output() editing = new EventEmitter();
}
