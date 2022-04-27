import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

export interface MetricCard {
  title: string;
  value: number;
  icon: string;
}

@Component({
  selector: '[cards] analytics-metric-card-list',
  templateUrl: './metric-card-list.component.html',
  styleUrls: ['./metric-card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardListComponent {
  @Input() cards: MetricCard[];
}