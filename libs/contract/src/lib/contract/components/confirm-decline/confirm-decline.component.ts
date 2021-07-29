import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'confirm-offer-decline',
  templateUrl: 'confirm-decline.component.html',
  styleUrls: ['./confirm-decline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDeclineComponent {

  form = new FormGroup({
    reason: new FormControl('', Validators.required),
  })

  constructor(
    private dialog: MatDialogRef<ConfirmDeclineComponent>,
  ) { }

  async declineContract() {
    const { reason } = this.form.value;
    this.dialog.close(reason);
  }
}
