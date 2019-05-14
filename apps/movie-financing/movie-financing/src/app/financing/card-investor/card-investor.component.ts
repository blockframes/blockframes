import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Investor } from '../model';

@Component({
  selector: 'financing-card-investor',
  templateUrl: './card-investor.component.html',
  styleUrls: ['./card-investor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardInvestorComponent {
  @Input() investor: Investor;

  constructor() {}
}
