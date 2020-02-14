import { Component, OnInit } from '@angular/core';
import { getValue } from '@blockframes/utils/helpers';
import { InvoiceService } from '@blockframes/contract/invoice/+state/invoice.service';
import { MovieCurrenciesSlug } from '@blockframes/utils/static-model';
import { getCodeBySlug } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: 'admin-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  public versionColumns = {
    'id': 'Id',
    'internalRef': 'Internal Ref',
    'paymentRef': 'Payment ref',
    'status': 'Status',
    'buyerId': 'Buyer',
    'collected': 'Collected',
    'legalDocumentId': 'Document',
    'contractLink': 'Contract',
    'emittedDate': 'Date',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'id',
    'internalRef',
    'paymentRef',
    'status',
    'buyerId',
    'collected',
    'legalDocumentId',
    'contractLink',
    'emittedDate',
    'edit',
  ];
  public rows: any[] = [];
  constructor(
    private invoiceService: InvoiceService,

  ) { }

  async ngOnInit() {
    const invoices = await this.invoiceService.getAllInvoices();
    this.rows =  invoices.map(i => {
      const row = {...i} as any;
      // Edit link
      row.edit = {
        id: i.id,
        link: `/c/o/admin/panel/invoice/${i.id}`,
      }

      row.contractLink = {
        id: i.contractId,
        link: `/c/o/admin/panel/contract/${i.contractId}`,
      }

      return row;
    });
  }


  filterPredicate(data: any, filter) {
    const columnsToFilter = [
      'id',
      'internalRef',
      'paymentRef',
      'status',
      'buyerId',
      'collected',
      'legalDocumentId',
      'contractId',
      'emittedDate',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  /** Utils function to get currency code for currency pipe. */
  public getCurrencyCode(currency: MovieCurrenciesSlug) {
    return getCodeBySlug('MOVIE_CURRENCIES', currency);
  }

  public getLegalDocument(legalDocumentId: string) {
    // @TODO 
    console.log(`retreiving : ${legalDocumentId}`);
    return '#';
  }

  public getOrgPath(orgId: string) {
    return  `/c/o/admin/panel/organization/${orgId}`;
  }
 
}
