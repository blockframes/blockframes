import { Injectable } from '@angular/core';
import { StoreConfig, Store } from '@datorama/akita';

export interface AdminState {
  analytics: {
    connectedUsers: any[]
  }
}

const initialState = {
  analytics: {
    connectedUsers: []
  }
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'admin' })
export class AdminStore extends Store<AdminState> {

  constructor() {
    super(initialState);
  }
}

