import { Injectable } from "@angular/core";
import { EntityStore, StoreConfig } from "@datorama/akita";
import { Terms } from "./terms.model";

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'terms' })
export class TermsStore extends EntityStore<Terms> {
  constructor() {
    super();
  }
}
