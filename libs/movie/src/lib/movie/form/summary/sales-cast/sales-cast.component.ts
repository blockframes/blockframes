import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieSalesCastForm } from '../../sales-cast/sales-cast.form';

@Component({
  selector: '[salesCast] movie-summary-sales-cast',
  templateUrl: './sales-cast.component.html',
  styleUrls: ['./sales-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummarySalesCastComponent {
  @Input() salesCast: MovieSalesCastForm;
  @Input() link: string;
}
