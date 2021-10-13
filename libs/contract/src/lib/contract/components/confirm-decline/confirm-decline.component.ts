
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'confirm-offer-decline',
  templateUrl: 'confirm-decline.component.html',
  styleUrls: ['./confirm-decline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDeclineComponent {

  reasonControl= new FormControl('')

  constructor(
    private dialog: MatDialogRef<ConfirmDeclineComponent>,
  ) { }

  async declineContract(event:Event) {
    event.preventDefault(); // ensures page doesn't reloads
    const reason = this.reasonControl.value;
    this.dialog.close(reason);
  }

  async cancel(){
    this.dialog.close()
  }
}
