import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, OnInit  } from '@angular/core';
import { Step } from '../../+state';

@Component({
  selector: 'material-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsComponent implements OnInit {
  @Output() newState : EventEmitter<string> = new EventEmitter();
  @Output() selectAllMaterials: EventEmitter<void> = new EventEmitter();
  @Input() allChecked: boolean;
  @Input() steps: Step[];

  deliverySteps: Step[];

  constructor() { }

  ngOnInit() {
    this.deliverySteps = this.steps;
  }

  public selectAll() {
    this.selectAllMaterials.emit();
  }

  public changeState(state: string) {
    this.newState.emit(state);
  }
}
