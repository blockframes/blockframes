import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'wallet-ask-password',
  templateUrl: './ask-password.component.html',
  styleUrls: ['./ask-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AskPasswordComponent {

  constructor(private dialog: MatDialogRef<AskPasswordComponent>) { }

  cancel() {
    this.dialog.close();
  }

  async unlockWallet(password: string) {
    this.dialog.close(password);
  }
}
