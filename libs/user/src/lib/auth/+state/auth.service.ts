import { Injectable } from '@angular/core';
import { AuthStore, User, AuthState, createUser } from './auth.store';
import { AuthQuery } from './auth.query';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FireAuthService, CollectionConfig } from 'akita-ng-fire';
import { User as FireBaseUser } from 'firebase';
import { map } from 'rxjs/operators';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, App } from '@blockframes/utils/apps';
import { PublicUser } from '@blockframes/user/types';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users', idKey: 'uid' })
export class AuthService extends FireAuthService<AuthState> {
  constructor(
    protected store: AuthStore,
    private query: AuthQuery,
    private functions: AngularFireFunctions,
    private routerQuery: RouterQuery
  ) {
    super(store);
  }

  /**
   * @dev This populates the RoleState part of the AuthState.
   * Used to check if logged in user is blockframesAdmin or not.
   */
  selectRoles(user: FireBaseUser) {
    return this.db.collection('blockframesAdmin').doc(user.uid).valueChanges().pipe(
      map(doc => ({ blockframesAdmin: doc !== undefined ? true : false }))
    );
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
    const app = getCurrentApp(this.routerQuery);
    return callSendReset({ email, app }).toPromise();
  }

  /** Send a new verification email to the current user */
  // @TODO (#2821)
  /*public async sendVerifyEmail() {
    const callSendVerify = this.functions.httpsCallable('sendVerifyEmail');
    const app = getCurrentApp(this.routerQuery);
    return callSendVerify({ email: this.query.user.email, app }).toPromise();
  }*/

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
  public createProfile(user: Partial<User>, ctx: { firstName: string, lastName: string }) {
    return {
      uid: user.uid,
      email: user.email,
      firstName: ctx.firstName,
      lastName: ctx.lastName
    };
  }

  /**
   * Call a backend function to create a new user
   * Reserved to blockframes admins only
   * @param email 
   * @param orgName 
   * @param app 
   */
  public async createUser(email: string, orgName: string, app: App = getCurrentApp(this.routerQuery)): Promise<PublicUser> {
    const f = this.functions.httpsCallable('createUser');
    const user : PublicUser =  await f({ email, orgName, app }).toPromise();

    return createUser(user);
  }

}
