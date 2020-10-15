import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AvailsSearchForm } from '../../form/search.form';
import { MediaValue } from '@blockframes/utils/static-model';
import { medias } from '@blockframes/utils/static-model/staticConsts';
import { MatDatepicker } from '@angular/material/datepicker';
import { NativeDateModule } from '@angular/material/core'

@Component({
  selector: 'distribution-avails-filter',
  templateUrl: './avails-filter.component.html',
  styleUrls: ['./avails-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailsFilterComponent {
  @Input() availsForm: AvailsSearchForm;

  public movieMedias: MediaValue[] = Object.keys(medias).map(key => medias[key]);

  /* Flags for the Territories chip input */
  public visibleTerritory = true;
  public selectableTerritory = true;
  public removableTerritory = true;

  private yearStart: number;
  private yearEnd: number;

  constructor(private routerQuery: RouterQuery) { }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  get isFormDisabled(): boolean {
    return this.availsForm.get('territory').disabled;
  }

  get territories() {
    return this.availsForm.get('territory');
  }

  /** Check media or uncheck it if it's already in the array. */
  public checkMedia(media: MediaValue) {
    if (this.movieMedias.includes(media)) {
      this.availsForm.checkMedia(media);
    }
  }

  public chosenYearHandler(year: Date, type: 'start' | 'end') {
    type === 'start' ? this.yearStart = year.getFullYear() : this.yearEnd = year.getFullYear();
  }

  public chosenMonthHandler(month: Date, datepicker: MatDatepicker<NativeDateModule>, type: 'start' | 'end') {
    const m = month.getMonth() + 1;
    const date = type === 'start' ? Date.parse(`${m}-1-${this.yearStart}`) : Date.parse(`${m}-1-${this.yearEnd}`)
    this.availsForm.get('terms').get(type).setValue(new Date(date));
    datepicker.close();
  }

  get showTerritoryFilter() {
    return this.routerQuery.getValue().state.url.split('/').indexOf('avails') < 0
  }
}
