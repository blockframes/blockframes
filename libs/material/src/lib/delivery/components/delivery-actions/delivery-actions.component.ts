import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { Step } from '../../+state';

@Component({
  selector: 'delivery-actions',
  templateUrl: './delivery-actions.component.html',
  styleUrls: ['./delivery-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryActionsComponent{
  @Output() newState : EventEmitter<string> = new EventEmitter();
  @Output() selectAllMaterials: EventEmitter<void> = new EventEmitter();
  @Input() allChecked: boolean;
  @Input() deliverySteps: Step[];

  constructor() { }

  public selectAll(event: MouseEvent) {
    event.stopPropagation();
    this.selectAllMaterials.emit();
  }

  public changeState(state: string) {
    this.newState.emit(state);
  }

}
