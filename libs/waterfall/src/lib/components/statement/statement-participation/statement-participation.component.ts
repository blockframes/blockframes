// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { RightholderPayment } from '@blockframes/model';

@Component({
  selector: 'waterfall-statement-participation',
  templateUrl: './statement-participation.component.html',
  styleUrls: ['./statement-participation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementParticipationComponent  {
  @Input() payment: RightholderPayment;
  @Input() label = 'Producer’s net participation';
}
