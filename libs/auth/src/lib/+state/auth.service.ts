import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthStore, User, createUser } from './auth.store';
import { filter, switchMap, map } from 'rxjs/operators';
import { NgWallet } from '@blockframes/ethers';
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

  public async delete() {
    const uid = this.afAuth.auth.currentUser.uid;
    try {
      await Promise.all([
        this.authCollection.doc(uid).delete(),
        this.afAuth.auth.currentUser.delete()
        // @todo create function to delete user sub collections
      ])
      this.store.update({ user: null })
    } catch (e) {
      throw new Error('Error while deleting account.');
    }
  }
}
