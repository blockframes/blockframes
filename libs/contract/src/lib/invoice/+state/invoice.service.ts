import { Injectable } from '@angular/core';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { InvoiceState, InvoiceStore } from './invoice.store';
import { InvoiceQuery } from './invoice.query';
import { Invoice } from './invoice.firestore';
import { createInvoiceFromFirestore } from './invoice.model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'invoices' })
export class InvoiceService extends CollectionService<InvoiceState> {
  constructor(private invoiceQuery: InvoiceQuery, store: InvoiceStore) {
    super(store);
  }

  /**
   * @dev ADMIN method
   * Get all invoices.
   */
  public async getAllInvoices(): Promise<Invoice[]> {
    const snap = await this.db
      .collection('invoices')
      .get()
      .toPromise();
    return snap.docs.map(i => createInvoiceFromFirestore(i.data()));
  }
}
