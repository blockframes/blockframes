import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { IpStore, IpState } from './ip.store';
import { Ip } from './ip.model';

@Injectable({
  providedIn: 'root'
})
export class IpQuery extends QueryEntity<IpState, Ip> {

  constructor(protected store: IpStore) {
    super(store);
  }

}
