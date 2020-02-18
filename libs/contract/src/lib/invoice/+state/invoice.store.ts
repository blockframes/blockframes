import { Injectable } from '@angular/core';
import { EntityState, ActiveState, EntityStore, StoreConfig } from '@datorama/akita';
import { Invoice, InvoiceDocument } from './invoice.firestore';
import { createInvoiceFromFirestore } from './invoice.model';

export interface InvoiceState extends EntityState<Invoice>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'invoices' })
export class InvoiceStore extends EntityStore<InvoiceState> {

  constructor() {
    super();
  }

  /** Convert all firestore timestamps into dates before populating the store. */
  akitaPreAddEntity(invoice: InvoiceDocument): Invoice {
    return createInvoiceFromFirestore(invoice);
  }

}

