import { Injectable } from '@angular/core';
import { StoreConfig, Store } from '@datorama/akita';
import { createDao, Dao } from './dao.model';

const initialState: Dao = createDao();
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'dao' })
export class DaoStore extends Store<Dao> {
  constructor() {
    super(initialState);
  }
}
