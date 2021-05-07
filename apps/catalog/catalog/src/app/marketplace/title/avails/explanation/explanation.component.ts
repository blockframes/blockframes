import { ChangeDetectionStrategy, Component, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
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
    private dialogRef: MatDialogRef<ExplanationComponent>
  ) { }

  close() {
    this.dialogRef.close();
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}