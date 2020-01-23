import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieSalesInfoForm } from '../../sales-info/sales-info.form';
import { MovieVersionInfoForm } from '../../version-info/version-info.form';

@Component({
  selector: '[versionInfo] movie-summary-technical-information',
  templateUrl: './technical-information.component.html',
  styleUrls: ['./technical-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryTechnicalInformationComponent {
  //@Input() salesInfo: MovieSalesInfoForm;
  public salesInfo = new MovieSalesInfoForm({ color: 'b', format: '1_33', formatQuality: '4k', soundFormat: 'mono' });
  @Input() versionInfo: MovieVersionInfoForm;
}
