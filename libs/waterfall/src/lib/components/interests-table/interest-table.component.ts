import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { InterestDetail } from '@blockframes/model';

@Component({
  selector: 'waterfall-interest-table',
  templateUrl: './interest-table.component.html',
  styleUrls: ['./interest-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterestTableComponent {
  @Input() interests: InterestDetail[] = [];
}
