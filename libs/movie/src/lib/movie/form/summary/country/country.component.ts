import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieSalesInfoForm } from '../../sales-info/sales-info.form';
import { MovieMainForm } from '../../main/main.form';

@Component({
  selector: '[main] [salesInfo] movie-summary-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryCountryComponent {
  @Input() salesInfo: MovieSalesInfoForm;
  @Input() main: MovieMainForm;
}
