// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Blockframes
import { Statement } from '@blockframes/model';

@Component({
  selector: 'waterfall-statement-table',
  templateUrl: './statement-table.component.html',
  styleUrls: ['./statement-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementTableComponent {
  @Input() statements: Statement[] = [];
}
