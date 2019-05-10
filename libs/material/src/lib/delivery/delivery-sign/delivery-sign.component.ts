import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '@blockframes/auth';
import { DeliveryQuery } from '../+state';
import { OrganizationQuery } from '@blockframes/organization';
import { StakeholderQuery } from '@blockframes/movie';

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
    public stakeholderQuery: StakeholderQuery,
    ) {}

  public sign() {
    this.data.onConfirm();
    this.snackBar.open('Delivery signed', 'close', { duration: 2000 });
    this.loading = false;
    this.close();
  }

  public async confirm() {
    this.loading = true;

    const orgIdsOfUser = this.organizationQuery.getAll().map(org => org.id);
    const stakeholders = this.stakeholderQuery.getAll();
    const stakeholderId = stakeholders.find(({ orgId }) => orgIdsOfUser.includes(orgId)).id;
    await this.service.signDelivery(this.deliveryQuey.getActive().id, stakeholderId);
    
    this.sign();
  }

  public close(): void {
    this.dialogRef.close();
  }

}
