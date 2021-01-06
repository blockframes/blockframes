import { Injectable } from '@angular/core';
import { StoreConfig, Store } from '@datorama/akita';


export interface ConnectedUserInfo {
  uid : string,
  firstConnexion: Date,
  lastConnexion: Date,
  pageView: number,
  sessionCount: number,
}

export interface AdminState {
  analytics: {
    connectedUsers: ConnectedUserInfo[]
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

