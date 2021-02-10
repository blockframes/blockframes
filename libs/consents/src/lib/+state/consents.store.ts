import { EntityState, EntityStore, ActiveState, StoreConfig } from '@datorama/akita';
import { Injectable } from "@angular/core";
import { Consents } from './consents.firestore';

export interface ConsentsState extends EntityState<Consents<Date>>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'consents' })
export class ConsentsStore extends EntityStore<ConsentsState> {
  constructor() {
    super();
  }

 public formatConsent(consent: Consents<Date>): Partial<Consents<Date>>{
   if (consent.access || consent.share){
     return {
       access: [],
       share: []
     }
   }
 }
}
