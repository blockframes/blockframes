// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Waterfall } from '@blockframes/model';

@Component({
  selector: 'waterfall-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCardComponent {
  @Input() title: string;
  @Input() mode : 'primary' | 'secondary' = 'secondary';
  @Input() price: number;
  @Input() waterfall: Waterfall;
}
