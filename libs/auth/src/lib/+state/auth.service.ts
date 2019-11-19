import { Injectable } from '@angular/core';
import { AuthStore, User, createUser, AuthState } from './auth.store';
import { Router } from '@angular/router';
import { AuthQuery } from './auth.query';
import firebase from 'firebase';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FireAuthService, CollectionConfig, WriteOptions } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users' })
export class AuthService extends FireAuthService<AuthState> {
  constructor(
    protected store: AuthStore,
    private router: Router,
    private query: AuthQuery,
    private functions: AngularFireFunctions
  ) {
    super(store);
  }

  //////////
  // AUTH //
  //////////

  /**
   * Initiate the password reset process for this user.
   * @param email email of the user
  */
  public resetPasswordInit(email: string) {
    const callSendReset = this.functions.httpsCallable('sendResetPasswordEmail');
    return callSendReset({ email }).toPromise();
  }

  /** Send a new verification email to the current user */
  public async sendVerifyEmail() {
    const callSendVerify = this.functions.httpsCallable('sendVerifyEmail');
    return callSendVerify({ email: this.query.user.email }).toPromise();
  }

  public checkResetCode(actionCode: string) {
    return this.fireAuth.auth.verifyPasswordResetCode(actionCode);
  }

  /**
   * Update the user password with a new one.
   * @param currentPassword current password of the user
   * @param newPassword new password set by the user
   */
  public async updatePassword(currentPassword: string, newPassword: string) {
    const userEmail = this.query.user.email;
    await this.signin(userEmail, currentPassword);
    return this.user.updatePassword(newPassword);
  }

  /**
   * Set a new password after it has been resetted.
   * @param actionCode specific code from Firebase to check the user
   * @param newPassword new password set by the owned of email
   */
  public handleResetPassword(actionCode: string, newPassword: string) {
    this.fireAuth.auth.confirmPasswordReset(actionCode, newPassword)
  }

  /** Redirect the user after he is signin. */
  onSignin() {
    return this.router.navigate(['layout']);
  }

  /** Basic function used to login. */
  // public async signin(email: string, password: string) {
  //   await this.afAuth.auth.signInWithEmailAndPassword(email, password);
  //   return this.router.navigate(['layout']);
  // }

  /**
   * Function to sign up to the application, creating a user in both database and authentication repertory.
   * It also send a verification email to the user.
   */
  public async signupUser(email: string, password: string, name: string, surname: string) {
    const userCredential = await this.signup(email, password);

    const user = createUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      name,
      surname
    });

    return this.create(user);
  }

  /** Function used to log out of the application. */
  public async logout() {
    await this.signOut();
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
  // public update(uid: string, user: Partial<User>) {
  //   return this.db.doc<User>(`users/${uid}`).update(user);
  // }

  onDelete() {
    const uid = this.query.userId;
    return this.deleteSubCollections(uid);
  }

  /** Delete the current User */
  // public async delete() {
  //   const uid = this.fireAuth.auth.currentUser.uid;

  //   await this.store.update({ user: null });
  //   await this.fireAuth.auth.currentUser.delete();
  //   await this.deleteSubCollections(uid);
  //   await this.db.doc<User>(`users/${uid}`).delete();
  // }

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
  public async getOrCreateUserByMail(email: string, orgName: string, invitationId?: string): Promise<User> {
    const f = firebase.functions().httpsCallable('getOrCreateUserByMail');
    const matchingEmail = await f({ email, orgName });
    return matchingEmail.data;
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
      return {
        ...state,
        user: {
          ...state.profile,
          financing: { rank }
        }
      };
    });
  }
}
