import { Injectable } from '@angular/core'
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { Terms } from './terms.model';
import { TermsStore } from './terms.store'

@Injectable({
  providedIn: 'root'
})
@CollectionConfig({
  path: 'terms'
})
export class TermsService extends CollectionService<Terms> {
  constructor(store: TermsStore) {
    super(store)
  }
}
