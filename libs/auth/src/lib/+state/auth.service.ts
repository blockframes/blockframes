import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthStore, User, createUser } from './auth.store';
import { FireQuery } from '@blockframes/utils';
import { Router } from '@angular/router';
import { AuthQuery } from './auth.query';
import firebase from 'firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private store: AuthStore,
    private afAuth: AngularFireAuth,
    private db: FireQuery,
    private router: Router,
    private query: AuthQuery
  ) {}

  //////////
  // AUTH //
  //////////

  public getAuth() {
    return this.afAuth.auth;
  }
  /**
   * Initiate the password reset process for this user
   * @param email email of the user
   */
  public resetPasswordInit(email: string) {
    return this.afAuth.auth.sendPasswordResetEmail(
      email,
      { url: 'http://localhost:4200/auth' });
  }

  public async updatePassword(currentPassword: string, newPassword: string) {
    const userEmail = this.query.user.email;
    await this.afAuth.auth.signInWithEmailAndPassword(userEmail, currentPassword);
    return this.afAuth.auth.currentUser.updatePassword(newPassword);
  }

  public handleResetPassword(newPassword: string, actionCode: string) {
    this.getAuth().confirmPasswordReset(actionCode, newPassword)
  }

  public async signin(email: string, password: string) {
    await this.afAuth.auth.signInWithEmailAndPassword(email, password);
    return this.router.navigate(['layout']);
  }

  public async signup(email: string, password: string, name: string, surname: string) {
    const authUser = await this.afAuth.auth.createUserWithEmailAndPassword(email, password);

    await authUser.user.sendEmailVerification();

    const user = createUser({
      uid: authUser.user.uid,
      email: authUser.user.email,
      name,
      surname
    });

    return this.create(user);
  }

  public async logout() {
    await this.afAuth.auth.signOut();
    this.store.update({ user: null });
  }

  //////////
  // USER //
  //////////
  /** Create a user based on firebase user */
  public create(user: User) {
    const userDocRef = this.db.firestore.collection('users').doc(user.uid);
    // transaction to UPSERT the user doc
    return this.db.firestore.runTransaction(async tx => {
      const userDoc = await tx.get(userDocRef);
      if (userDoc.exists) {
        tx.update(userDocRef, user);
      } else {
        tx.set(userDocRef, user);
      }
    });
  }

  /** Update a user */
  public update(uid: string, user: Partial<User>) {
    return this.db.doc<User>(`users/${uid}`).update(user);
  }

  /** Delete the current User */
  public async delete() {
    const uid = this.afAuth.auth.currentUser.uid;

    await this.store.update({ user: null });
    await this.afAuth.auth.currentUser.delete();
    await this.deleteSubCollections(uid);
    await this.db.doc<User>(`users/${uid}`).delete();
  }

  public async sendVerifyEmail() {
    return this.afAuth.auth.currentUser.sendEmailVerification();
  }

  /** Deletes user subCollections */
  private async deleteSubCollections(uid: string) {
    // @todo check if user is the only member of org (and the only ADMIN)
    // @todo remove uid from org.userIds
    const permissions = await this.getUserSubcollectionItems(uid, 'permissions');

    return Promise.all(
      permissions.map(({ id }) =>
        this.db
          .doc<User>(`users/${uid}`)
          .collection('permissions')
          .doc(id)
          .delete()
      )
    );
  }

  /** Returns promise of subcollection[] */
  private async getUserSubcollectionItems(uid: string, collectionName: string) {
    const items = await this.db
      .doc<User>(`users/${uid}`)
      .collection(collectionName)
      .get()
      .toPromise();
    return items.docs;
  }

  public async getOrCreateUserByMail(email: string): Promise<User> {
    const f = firebase.functions().httpsCallable('getOrCreateUserByMail');
    return f({ email }).then(matchingEmail => matchingEmail.data);
  }

  public async getUserByMail(prefix: string): Promise<User[]> {
    const f = firebase.functions().httpsCallable('findUserByMail');
    return f({ prefix }).then(matchingUsers => matchingUsers.data);
  }

  // TODO THIS IS A QUICK FIX OF MOVIE FINANCING RANK MADE FOR TORONTO, THINK OF A BETTER WAY AFTERWARD
  //---------------------------
  //   MOVIE FINANCING RANK
  //---------------------------
  public changeRank(rank: string) {
    this.store.update(state => {
      return {...state, user: {
        ...state.user,
        financing: { rank }
      }}
    });
  }
}
