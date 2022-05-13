import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { AnalyticData } from '@blockframes/analytics/+state/utils';
import { Territory, TerritoryISOA3Value, parseToAll, territoriesISOA3, staticModel } from '@blockframes/model';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { boolean } from '@blockframes/utils/decorators/decorators';

const territories = parseToAll('territories', 'world') as Territory[];

@Component({
  selector: 'analytics-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsMapComponent {
  isLoading = true;

  zero: TerritoryISOA3Value[] = [];
  lessThanFive: TerritoryISOA3Value[] = [];
  lessThanFifty: TerritoryISOA3Value[] = [];
  moreThanFifty: TerritoryISOA3Value[] = [];
  selected: TerritoryISOA3Value;

  topCountries: AnalyticData[] = [];
  @Input() topCountryCount = 3;
  @Input() mapLegend: TemplateRef<HTMLElement>;
  @Input() topCountriesTemplate: TemplateRef<HTMLElement>;
  @Input() @boolean noHeader = false;
  @Input() set data(data: AnalyticData[]) {
    if (!data) return;
    this.isLoading = false;

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
    this.topCountries = sorted.splice(0, this.topCountryCount);
  }

  @Input() @boolean selectable = false;
  @Output() selection: EventEmitter<string> = new EventEmitter();

  toggleSelect(isoA3: TerritoryISOA3Value) {
    if (!this.selectable) return;
    this.selected = this.selected === isoA3 ? '' : isoA3;
    const key = getKeyIfExists('territoriesISOA3', this.selected);
    const selection = key === 'world' ? '' : staticModel.territories[key];
    this.selection.next(selection);
  }
}
