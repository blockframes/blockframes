import { Injectable } from '@angular/core';
import { StoreConfig, Store } from '@datorama/akita';


export interface ConnectedUserInfo {
  uid : string,
  firstConnexion: Date,
  lastConnexion: Date,
  pageView: number,
  sessionCount: number,
}

export interface CrmState {
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
@StoreConfig({ name: 'crm' })
export class CrmStore extends Store<CrmState> {

  constructor() {
    super(initialState);
  }
}

