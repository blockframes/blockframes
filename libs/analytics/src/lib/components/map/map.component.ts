import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { AnalyticData } from "@blockframes/analytics/+state/utils";
import { Territory, TerritoryISOA3Value, parseToAll, territoriesISOA3 } from "@blockframes/utils/static-model";

const territories = parseToAll('territories', 'world') as Territory[];

@Component({
  selector: 'analytics-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsMapComponent {

  zero: TerritoryISOA3Value[] = [];
  lessThanFive: TerritoryISOA3Value[] = [];
  lessThanFifty: TerritoryISOA3Value[] = [];
  moreThanFifty: TerritoryISOA3Value[] = [];

  top3: AnalyticData[] = [];

  @Input() set data(data: AnalyticData[]) {
    if (!data) return;

    for (const territory of territories) {
      const isoA3 = territoriesISOA3[territory];
      const value = data.find(d => d.key === territory);

      if (!value) {
        this.zero.push(isoA3);
        continue;
      }

      if (value.count < 5) {
        this.lessThanFive.push(isoA3);
      } else if (value.count < 50) {
        this.lessThanFifty.push(isoA3);
      } else {
        this.moreThanFifty.push(isoA3);
      }
    }

    const sorted = data.sort((a, b) => b.count - a.count);
    this.top3 = sorted.splice(0, 3);
  }
}