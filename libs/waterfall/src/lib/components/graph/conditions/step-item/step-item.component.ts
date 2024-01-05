
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'waterfall-step-item',
  templateUrl: './step-item.component.html',
  styleUrls: ['./step-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallStepItemComponent {

  @Input() index: number;
  @Input() conditionCount: number;

  @Output() editStep = new EventEmitter();
  @Output() deleteStep = new EventEmitter();
}