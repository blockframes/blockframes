import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Territory, TerritoryISOA3Value, parseToAll, territoriesISOA3, staticModel, AnalyticData } from '@blockframes/model';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { BehaviorSubject, combineLatest, Subject, Subscription } from 'rxjs';

const territories = parseToAll('territories', 'world') as Territory[];

@Component({
  selector: 'analytics-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsMapComponent implements OnDestroy {
  isLoading = true;

  zero: TerritoryISOA3Value[] = [];
  lessThanFive: TerritoryISOA3Value[] = [];
  lessThanFifty: TerritoryISOA3Value[] = [];
  moreThanFifty: TerritoryISOA3Value[] = [];
  selected: TerritoryISOA3Value;
  top: AnalyticData[] = [];

  private _topCount = new BehaviorSubject(3);
  private _data = new Subject<AnalyticData[]>();
  private sub: Subscription;

  @Input() @boolean showLegend = false;
  @Input() @boolean horizontal = false;
  @Input() set topCount(count: number) {
    this._topCount.next(count);
  }
  @Input() set data(data: AnalyticData[]) {
    this._data.next(data);
  }

  @Input() @boolean selectable = false;
  @Output() selection: EventEmitter<string> = new EventEmitter();

  constructor() {
    this.sub = combineLatest([
      this._data.asObservable(),
      this._topCount.asObservable()
    ]).subscribe(([data, topCount]) => this.getTopCountries(data, topCount));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private getTopCountries(data: AnalyticData[], count: number) {
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

    const sorted = [...data].sort((a, b) => b.count - a.count);
    this.top = sorted.splice(0, count);
    this.isLoading = false;
  }

  toggleSelect(isoA3: TerritoryISOA3Value) {
    if (!this.selectable) return;
    this.selected = this.selected === isoA3 ? '' : isoA3;
    const key = getKeyIfExists('territoriesISOA3', this.selected);
    const selection = key === 'world' ? '' : staticModel.territories[key];
    this.selection.next(selection);
  }

}
