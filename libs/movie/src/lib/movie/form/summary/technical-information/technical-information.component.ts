import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieSalesInfoForm } from '../../sales-info/sales-info.form';
import { MovieVersionInfoForm } from '../../version-info/version-info.form';

@Component({
  selector: '[salesInfo] [versionInfo] movie-summary-technical-information',
  templateUrl: './technical-information.component.html',
  styleUrls: ['./technical-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryTechnicalInformationComponent {
  @Input() salesInfo: MovieSalesInfoForm;
  @Input() versionInfo: MovieVersionInfoForm;
}
