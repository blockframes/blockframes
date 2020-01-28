import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieMainForm } from '../../main/main.form';
import { MovieSalesCastForm } from '../../sales-cast/sales-cast.form';

@Component({
  selector: '[salesCast] [main] movie-summary-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryCreditComponent {
  @Input() main: MovieMainForm;
  @Input() salesCast: MovieSalesCastForm;
  @Input() link: string;
}
