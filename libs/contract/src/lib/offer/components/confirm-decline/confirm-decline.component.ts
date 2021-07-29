import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContractService } from '@blockframes/contract/contract/+state';

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
    private contractService: ContractService,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { contractId: string }
  ) { }

  async declineOffer() {
    try {
      this.form.disable();
      const { reason: declineReason } = this.form.value;
      await this.contractService.update(this.data.contractId, { status: 'declined', declineReason })
      this.dialog.close();
    } catch (err) {
      this.form.enable();
      console.error({err});
      this.snackbar.open(`There was an error, please try again later`, '', { duration: 4000 })
    }
  }
}
