import { Injectable } from "@angular/core";
import { ActiveState, EntityState, EntityStore, StoreConfig } from "@datorama/akita";
import { Term } from "./term.model";

export interface TermState extends EntityState<Term, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'terms' })
export class TermStore extends EntityStore<TermState> {
  constructor() {
    super();
  }
}
