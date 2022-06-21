import { ChangeDetectionStrategy, Component, Inject, Input, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'catalog-movie-avails-explanation',
  templateUrl: 'explanation.component.html',
  styleUrls: ['./explanation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplanationComponent {

  constructor(
    @Optional() private intercom: Intercom,
    private dialogRef: MatDialogRef<ExplanationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: string },
  ) { }

  close() {
    this.dialogRef.close();
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

}