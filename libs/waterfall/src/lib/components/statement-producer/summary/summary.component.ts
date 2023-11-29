import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Statement } from '@blockframes/model';
import { StatementForm } from '@blockframes/waterfall/form/statement.form';

@Component({
  selector: 'waterfall-statement-producer-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementProducerSummaryComponent {

  @Input() statement: Statement;
  @Input() form: StatementForm;

}