import firebase from 'firebase/app';
import 'firebase/firestore';

export interface IMaintenanceDoc {
  endedAt: firebase.firestore.Timestamp
  startedAt: firebase.firestore.Timestamp
}

export interface IVersionDoc {
  currentVersion: number;
}