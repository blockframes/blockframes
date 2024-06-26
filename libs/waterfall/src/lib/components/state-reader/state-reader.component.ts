// Angular
import { Component, ChangeDetectionStrategy, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { History, Waterfall } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

export interface StateDialogData {
  title: string;
  waterfall: Waterfall;
  state: unknown;
}

@Component({
  selector: 'waterfall-state-reader',
  templateUrl: './state-reader.component.html',
  styleUrls: ['./state-reader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateReaderComponent {
  @Input() waterfall: Waterfall;
  @Input() state: History;

  constructor(public dialog: MatDialog) { }

  details(type: string, name: string, state: unknown) {

    this.dialog.open(StateDialogComponent, {
      data: createModalData<StateDialogData>({
        title: `${type} "${name}"`,
        waterfall: this.waterfall,
        state
      }),
      autoFocus: false
    });

  }
}

@Component({
  selector: 'waterfall-state-dialog',
  templateUrl: 'state-dialog.html',
})
export class StateDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: StateDialogData) { }
}
