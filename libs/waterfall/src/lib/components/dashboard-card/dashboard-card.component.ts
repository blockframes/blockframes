// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PricePerCurrency, mainCurrency } from '@blockframes/model';

@Component({
  selector: 'waterfall-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCardComponent {
  public mainCurrency = mainCurrency;
  @Input() title: string;
  @Input() mode : 'primary' | 'secondary' = 'secondary';
  @Input() price: PricePerCurrency;
}
