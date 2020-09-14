// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Form
import { MovieForm, CreditForm } from '../../../../form/movie.form';

@Component({
  selector: '[movie] movie-summary-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryCreditComponent {
  @Input() movie: MovieForm;
  @Input() link: string;

  public producerHasNoValue(producer: CreditForm) {
    return !producer.get('firstName').value || !producer.get('lastName').value || !producer.get('role').value;
  }
}
