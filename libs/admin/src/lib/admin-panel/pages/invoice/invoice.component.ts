import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { InvoiceService } from '@blockframes/contract/invoice/+state/invoice.service';
import { Invoice } from '@blockframes/contract/invoice/+state/invoice.firestore';
import { InvoiceAdminForm } from '../../forms/invoice-admin.form';
import { PaymentStatus } from '@blockframes/utils/common-interfaces/price';


@Component({
  selector: 'admin-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceComponent implements OnInit {
  public invoiceId = '';
  private invoice: Invoice;
  public invoiceForm: InvoiceAdminForm;
  public statuses: string[];
  public paymentStatus: any;

  constructor(
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.invoiceId = this.route.snapshot.paramMap.get('invoiceId');
    this.invoice = await this.invoiceService.getValue(this.invoiceId);
    this.invoiceForm = new InvoiceAdminForm(this.invoice);

    this.statuses = Object.keys(PaymentStatus);
    this.paymentStatus = PaymentStatus;
    this.cdRef.detectChanges();
  }

  public async update() {
    if (this.invoiceForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const update = {
      contractId: this.invoiceForm.get('contractId').value,
      status: this.invoiceForm.get('status').value,
      buyerId: this.invoiceForm.get('buyerId').value,
    }

    await this.invoiceService.update(this.invoiceId, update);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

}
