import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Credit } from '@blockframes/utils/common-interfaces';

@Component({
  selector: 'title-credit-card',
  templateUrl: './credit-card.component.html',
  styleUrls: ['./credit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditCardComponent {
  @Input() credit: Credit;
}
