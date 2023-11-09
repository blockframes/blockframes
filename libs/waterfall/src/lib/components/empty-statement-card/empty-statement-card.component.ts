// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { StatementType } from '@blockframes/model';
import { boolean } from '@blockframes/utils/decorators/decorators';

// Blockframes

@Component({
  selector: 'waterfall-empty-statement-card',
  templateUrl: './empty-statement-card.component.html',
  styleUrls: ['./empty-statement-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStatementCardComponent {

  @Input() type: StatementType;
  @Input() @boolean disabled = false;

}
