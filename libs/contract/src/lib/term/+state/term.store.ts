import { Injectable } from "@angular/core";
import { EntityStore, StoreConfig } from "@datorama/akita";
import { Term } from "./term.model";

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'terms' })
export class TermStore extends EntityStore<Term> {
  constructor() {
    super();
  }
}
