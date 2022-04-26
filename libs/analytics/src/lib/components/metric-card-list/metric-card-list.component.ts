import { ChangeDetectionStrategy, Component, ContentChildren, QueryList } from "@angular/core";
import { MetricCardComponent } from './metric-card/metric-card.component';

@Component({
  selector: 'analytics-metric-card-list',
  templateUrl: './metric-card-list.component.html',
  styleUrls: ['./metric-card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardListComponent {
  @ContentChildren(MetricCardComponent, { descendants: true }) cards: QueryList<MetricCardComponent>;
}