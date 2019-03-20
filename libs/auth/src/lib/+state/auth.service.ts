import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthStore, User, createUser, AccountForm } from './auth.store';
import { filter, switchMap, map } from 'rxjs/operators';
import { NgWallet } from '@blockframes/ethers';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public authCollection: AngularFirestoreCollection<User>;

  constructor(
    private store: AuthStore,
    private afAuth: AngularFireAuth,
    private wallet: NgWallet,
    private db: AngularFirestore,
  ) {
    this.authCollection = this.db.collection<User>("users");
    this.subscribeOnUser();
  }

  public signin(mail: string, pwd: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(mail, pwd);
  }

  public async signup(mail: string, pwd: string) {
    try {
      await this.afAuth.auth.createUserWithEmailAndPassword(mail, pwd);
      this.wallet.createRandom();
    } catch (err) {
      throw new Error(err);
    }
  }

  public updateUser(uid: string, account: any) {
    return this.db.collection('users').doc(uid).update(account);
  }

  private subscribeOnUser() {
    this.afAuth.authState
      .pipe(
        filter(user => !!user),
        switchMap(({ uid }) => this.authCollection.doc(uid).valueChanges())
      )
      .pipe(map(user => (user ? createUser(user) : null)))
      .subscribe((user: User) => this.store.update({ user }));
  }

  public logout() {
    this.afAuth.auth.signOut();
    this.store.update({ user: null })
  }
}
