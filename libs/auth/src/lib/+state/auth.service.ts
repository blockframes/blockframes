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

  /** Get the auth from AngulareFireAuth */
  public getAuth() {
    return this.afAuth.auth;
  }

  /**
   * Initiate the password reset process for this user.
   * @param email email of the user
   */
  public resetPasswordInit(email: string) {
    return this.afAuth.auth.sendPasswordResetEmail(
      email,
      { url: 'http://localhost:4200/auth' });
  }

  /**
   * Update the user password with a new one.
   * @param currentPassword current password of the user
   * @param newPassword new password set by the user
   */
  public async updatePassword(currentPassword: string, newPassword: string) {
    const userEmail = this.query.user.email;
    await this.afAuth.auth.signInWithEmailAndPassword(userEmail, currentPassword);
    return this.afAuth.auth.currentUser.updatePassword(newPassword);
  }

  /**
   * Set a new password after it has been resetted.
   * @param actionCode specific code from Firebase to check the user
   * @param newPassword new password set by the owned of email
   */
  public handleResetPassword(actionCode: string, newPassword: string) {
    this.getAuth().confirmPasswordReset(actionCode, newPassword)
  }

  /** Basic function used to login. */
  public async signin(email: string, password: string) {
    await this.afAuth.auth.signInWithEmailAndPassword(email, password);
    return this.router.navigate(['layout']);
  }

  /**
   * Function to sign up to the application, creating a user in both database and authentication repertory.
   * It also send a verification email to the user.
   */
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

  /** Function used to log out of the application. */
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

  /** Send a new verification email to the current user */
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

  /** Call a firebase function to get or create a user.
   * @email find the user with this email. If email doesn't match with an existing user,
   * create a user with this email address.
   */
  public async getOrCreateUserByMail(email: string): Promise<User> {
    const f = firebase.functions().httpsCallable('getOrCreateUserByMail');
    return f({ email }).then(matchingEmail => matchingEmail.data);
  }

  /** Call a firebase function to get a list of users corresponding to the `prefix` string. */
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
