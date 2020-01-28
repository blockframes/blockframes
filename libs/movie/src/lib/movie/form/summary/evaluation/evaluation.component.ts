import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieSalesInfoForm } from '../../sales-info/sales-info.form';

@Component({
  selector: '[salesInfo] movie-summary-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryEvaluationComponent {
  @Input() salesInfo: MovieSalesInfoForm;
  @Input() link: string;
}
