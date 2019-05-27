import { Injectable } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/firestore';
import { ID } from '@datorama/akita';
import { IpStore } from './ip.store';
import { Ip, createIp } from './ip.model';
import { FireQuery } from '@blockframes/utils';

@Injectable({ providedIn: 'root' })
export class IpService {
  private collection: AngularFirestoreCollection<Ip>;

  constructor(
    private store: IpStore,
    private db: FireQuery,
  ) {
    this.collection = this.db.collection('ip');
  }

  public async add(ip: Partial<Ip>) {
    const id = this.db.createId();
    await this.store.add(createIp({...ip, id}));
    return id;
  }

  public update(id, ip: Partial<Ip>) {
    this.store.update(id, ip);
  }

  public remove(id: ID | ID[]) {
    this.store.remove(id);
  }
}
