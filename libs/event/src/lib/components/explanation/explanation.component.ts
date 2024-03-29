import { ChangeDetectionStrategy, Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventTypes } from '@blockframes/model';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'festival-event-explanation',
  templateUrl: 'explanation.component.html',
  styleUrls: ['./explanation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplanationComponent {

  constructor(
    @Optional() private intercom: Intercom,
    private dialogRef: MatDialogRef<ExplanationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: EventTypes },
  ) { }

  close() {
    this.dialogRef.close();
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

}