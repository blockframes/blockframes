import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { Stakeholder } from '../../+state';

@Component({
  selector: 'stakeholder-item',
  templateUrl: './stakeholder-item.component.html',
  styleUrls: ['./stakeholder-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderItemComponent {
  @Input() stakeholder: Stakeholder;
  @Output() removed = new EventEmitter();
}
