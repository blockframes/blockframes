
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
  @Input() set canUpdate(canUpdate: boolean) {
    this._canUpdate = canUpdate;
    this.tooltip = this._canUpdate ? $localize`Edit Step Conditions` : $localize`View Step Conditions`;
  }
  get canUpdate() { return this._canUpdate; }
  public tooltip = $localize`Edit Step Conditions`;
  private _canUpdate: boolean;

  @Output() editStep = new EventEmitter();
  @Output() deleteStep = new EventEmitter();
}