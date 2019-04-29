import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'material-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsComponent {
  @Output() newState : EventEmitter<string> = new EventEmitter();

  constructor() { }

  public changeState(state: string) {
    this.newState.emit(state)
  }
}
