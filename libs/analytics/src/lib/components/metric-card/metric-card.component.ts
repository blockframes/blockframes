import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: '[title][value][icon] analytics-metric-card',
  templateUrl: './metric-card.component.html',
  styleUrls: ['./metric-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'surface'
  }
})
export class MetricCardComponent {
  @Input() title: string;
  @Input() value: number;
  @Input() icon: string;
}