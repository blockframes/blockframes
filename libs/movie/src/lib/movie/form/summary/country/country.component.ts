import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieSalesInfoForm } from '../../sales-info/sales-info.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { TerritoriesSlug } from '@blockframes/utils/static-model/types';

@Component({
  selector: '[salesInfo] [originCountries] movie-summary-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryCountryComponent {
  @Input() salesInfo: MovieSalesInfoForm;
  @Input() originCountries: FormList<TerritoriesSlug>;
}
