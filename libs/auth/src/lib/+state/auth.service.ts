import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthStore, User, createUser } from './auth.store';
import { WalletService } from 'libs/ethers/src/lib/wallet/+state';
import { FireQuery } from '@blockframes/utils';
import { Router } from '@angular/router';
import { AuthQuery } from './auth.query';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private store: AuthStore,
    private afAuth: AngularFireAuth,
    private wallet: WalletService,
    private db: FireQuery,
    private router: Router,
    private query: AuthQuery
  ) {}

  //////////
  // AUTH //
  //////////

  public async updatePassword(actualPassword: string, newPassword: string) {
    const userEmail = this.query.user.email;
    await this.afAuth.auth.signInWithEmailAndPassword(userEmail, actualPassword);
    await this.afAuth.auth.currentUser.updatePassword(newPassword);
  }

  public async signin(email: string, password: string) {
    await this.afAuth.auth.signInWithEmailAndPassword(email, password);
    this.router.navigate(['layout']);
  }

  public signup(email: string, password: string) {
    this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  public async logout() {
    await this.afAuth.auth.signOut();
    this.store.update({ user: null });
  }

  //////////
  // USER //
  //////////
  /** Create a user based on firebase user */
  public create({ email, uid }: firebase.User) {
    const user = createUser({ email, uid })
    return this.db.doc<User>(`users/${uid}`).set(user);
  }

  /** Upate a user */
  public update(uid: string, user: Partial<User>) {
    return this.db.doc<User>(`users/${uid}`).update(user);
  }

  /** Delete the current User */
  public async delete() {
    const uid = this.afAuth.auth.currentUser.uid;

    await this.store.update({ user: null });
    await this.afAuth.auth.currentUser.delete();
    await this._deleteSubCollections(uid);
    await this.db.doc<User>(`users/${uid}`).delete();
  }

  /** Deletes user subCollections */
  private async _deleteSubCollections (uid) {
    // @todo check if user is the only member of org (and the only ADMIN)
    // @todo remove uid from org.userIds
    const permissions = await this._getUserSubcollectionItems(uid, 'permissions');
    return await permissions.map(o => this.db.doc<User>(`users/${uid}`)
      .collection('permissions')
      .doc(o.id)
      .delete()
    );
  }

  /** Returns promise of subcollection[] */
  private async _getUserSubcollectionItems(uid, collectionName) {
    const items = await this.db.doc<User>(`users/${uid}`)
      .collection(collectionName)
      .get()
      .toPromise();
    return items.docs;
  }
}
