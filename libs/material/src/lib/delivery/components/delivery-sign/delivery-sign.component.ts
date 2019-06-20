import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '@blockframes/auth';
import { DeliveryQuery } from '../../+state';
import { OrganizationQuery } from '@blockframes/organization';

@Component({
  selector: 'material-delivery-sign',
  templateUrl: './delivery-sign.component.html',
  styleUrls: ['./delivery-sign.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliverySignComponent {
  public form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  public loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data:
      {
        onConfirm: () => void
      },
    public dialogRef: MatDialogRef<DeliverySignComponent>,
    private snackBar: MatSnackBar,
    public service: AuthService,
    public deliveryQuey: DeliveryQuery,
    public organizationQuery: OrganizationQuery,
    public deliveryQuery: DeliveryQuery,
    ) {}

  public sign() {
    this.data.onConfirm();
    this.snackBar.open('Delivery signed', 'close', { duration: 2000 });
    this.loading = false;
    this.close();
  }

  public async confirm() {
    this.loading = true;
    const delivery = this.deliveryQuery.getActive();
    const orgIdsOfUser = this.organizationQuery.getAll().map(org => org.id);
    const stakeholderId = delivery.stakeholders.find(({ orgId }) => orgIdsOfUser.includes(orgId)).id;
    // await this.service.signDelivery(delivery.id, stakeholderId);// TODO WALLET SERVICE ISSUE #315, make this logic in delivery-editable

    this.sign();
  }

  public close(): void {
    this.dialogRef.close();
  }

}
