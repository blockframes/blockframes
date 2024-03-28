// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieCurrency, PricePerCurrency } from '@blockframes/model';

@Component({
  selector: 'waterfall-statement-participation',
  templateUrl: './statement-participation.component.html',
  styleUrls: ['./statement-participation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementParticipationComponent {
  @Input() payment: { price: number, currency: MovieCurrency };
  @Input() price: PricePerCurrency;
  @Input() label = 'Producer’s net participation';
}
