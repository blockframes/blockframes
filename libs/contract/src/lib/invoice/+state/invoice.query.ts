import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { InvoiceStore, InvoiceState } from './invoice.store';

@Injectable({ providedIn: 'root' })
export class InvoiceQuery extends QueryEntity<InvoiceState> {

  constructor(protected store: InvoiceStore) {
    super(store);
  }

}
