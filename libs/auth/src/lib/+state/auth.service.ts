import { Injectable } from '@angular/core';
import { AuthStore, User, AuthState } from './auth.store';
import { Router } from '@angular/router';
import { AuthQuery } from './auth.query';
import firebase from 'firebase';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FireAuthService, CollectionConfig } from 'akita-ng-fire';

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

  /** Create the user in users collection on firestore. */
  createProfile(user: Partial<User>, ctx: any) {
    return {
      uid: user.uid,
      email: user.email,
      name: ctx.name,
      surname: ctx.surname
    };
  }

  /** Redirect the user after he is signin. */
  onSignin() {
    return this.router.navigate(['layout']);
  }

  //////////
  // USER //
  //////////

  /** Call a firebase function to get or create a user.
   * @email find the user with this email. If email doesn't match with an existing user,
   * create a user with this email address.
   */
  public async getOrCreateUserByMail(email: string, orgName: string, invitationId?: string): Promise<User> {
    const f = firebase.functions().httpsCallable('getOrCreateUserByMail');
    const matchingEmail = await f({ email, orgName });
    return matchingEmail.data;
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
