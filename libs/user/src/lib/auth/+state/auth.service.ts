import { Injectable } from '@angular/core';
import { AuthStore, User, AuthState } from './auth.store';
import { AuthQuery } from './auth.query';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FireAuthService, CollectionConfig } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users', idKey: 'uid' })
export class AuthService extends FireAuthService<AuthState> {
  constructor(
    protected store: AuthStore,
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
    return this.auth.verifyPasswordResetCode(actionCode);
  }

  /**
   * @description function that gets triggered when
   * AuthService.signOut is called
   */
  async onSignout() {
    localStorage.clear();
    /**
     * the databases function seems to be not typed
     * in typescript node.
     */
    const dbKeys = await (window.indexedDB as any).databases();
    for (const key of dbKeys) {
      indexedDB.deleteDatabase(key.name);
    }
    window.location.reload();
  }

  /**
   * Update the user password with a new one.
   * @param currentPassword current password of the user
   * @param newPassword new password set by the user
   */
  public async updatePassword(currentPassword: string, newPassword: string) {
    const userEmail = this.query.user.email;
    const user = await this.user;
    await this.signin(userEmail, currentPassword);
    return user.updatePassword(newPassword);
  }

  /**
   * Set a new password after it has been resetted.
   * @param actionCode specific code from Firebase to check the user
   * @param newPassword new password set by the owned of email
   */
  public handleResetPassword(actionCode: string, newPassword: string) {
    this.auth.confirmPasswordReset(actionCode, newPassword)
  }

  /** Create the user in users collection on firestore. */
  createProfile(user: Partial<User>, ctx: { name: string, surname: string }) {
    return {
      uid: user.uid,
      email: user.email,
      name: ctx.name,
      surname: ctx.surname
    };
  }

  /** Call a firebase function to get or create a user.
   * @email find the user with this email. If email doesn't match with an existing user,
   * create a user with this email address.
   */
  public async getOrCreateUserByMail(email: string, orgName: string, invitationId?: string): Promise<User> {
    const f = this.functions.httpsCallable('getOrCreateUserByMail');
    return f({ email, orgName }).toPromise();
  }
}
