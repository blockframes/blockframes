import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { InvoiceService } from '@blockframes/contract/invoice/+state/invoice.service';
import { Invoice } from '@blockframes/contract/invoice/+state/invoice.firestore';
import { InvoiceAdminForm } from '../../forms/invoice-admin.form';
import { PaymentStatus } from '@blockframes/utils/common-interfaces/price';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';


@Component({
  selector: 'admin-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractComponent implements OnInit {
  public contractId = '';
  private contract: Contract;
  public invoiceForm: InvoiceAdminForm;
  public statuses: string[];

  constructor(
    private contractService: ContractService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.contractId = this.route.snapshot.paramMap.get('contractId');
    this.contract = await this.contractService.getValue(this.contractId);
    this.invoiceForm = new InvoiceAdminForm(this.contract);

    this.statuses = Object.keys(PaymentStatus);
    this.cdRef.detectChanges();
  }

  public async update() {
    if (this.invoiceForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const update = {
      status : this.invoiceForm.get('status').value,
    }

    await this.invoiceService.update(this.invoiceId, update);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

}
