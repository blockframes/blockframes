import { Component, OnInit } from '@angular/core';
import { getValue } from '@blockframes/utils/helpers';
import { InvoiceService } from '@blockframes/contract/invoice/+state/invoice.service';

@Component({
  selector: 'admin-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  public versionColumns = {
    'id': 'Id',

  };

  public initialColumns: string[] = [
    'id',

  ];
  public rows: any[] = [];
  constructor(
    private invoiceService: InvoiceService,
  
  ) { }

  async ngOnInit() {
    this.rows = await this.invoiceService.getAllInvoices();
  }


  filterPredicate(data: any, filter) {
    const columnsToFilter = [
      'id',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
