import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { IpStore } from './ip.store';
import { Ip, createIp } from './ip.model';

@Injectable({ providedIn: 'root' })
export class IpService {
  private readonly collection = 'scripts';

  constructor(
    private store: IpStore
  ) { }

  public add(ip: Ip) {
    // this.firestore.collection(this.collection).add(ip);
    this.store.add(createIp(ip));
  }

  public update(id, ip: Partial<Ip>) {
    this.store.update(id, ip);
  }

  public remove(id: ID) {
    this.store.remove(id);
  }
}
