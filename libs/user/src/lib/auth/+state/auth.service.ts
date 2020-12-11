import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthStore, User, AuthState, createUser } from './auth.store';
import { AuthQuery } from './auth.query';
import { AngularFireFunctions } from '@angular/fire/functions';
import { User as FireBaseUser } from 'firebase';
import { UserCredential } from '@firebase/auth-types';
import { FireAuthService, CollectionConfig } from 'akita-ng-fire';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { map, take } from 'rxjs/operators';
import { getCurrentApp, App } from '@blockframes/utils/apps';
import { PublicUser } from '@blockframes/user/types';
import { Intercom } from 'ng-intercom';
import { getIntercomOptions } from '@blockframes/utils/intercom/intercom.service';
import { GDPRService } from '@blockframes/utils/gdpr-cookie/gdpr-service/gdpr.service';
import { intercomId } from '@env';
import { createDocumentMeta, DocumentMeta } from '@blockframes/utils/models-meta';
import { NotificationStore } from '@blockframes/notification/+state/notification.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users', idKey: 'uid' })
export class AuthService extends FireAuthService<AuthState> {
  constructor(
    protected store: AuthStore,
    private http: HttpClient,
    private query: AuthQuery,
    private functions: AngularFireFunctions,
    private routerQuery: RouterQuery,
    private gdprService: GDPRService,
    private notifications: NotificationStore,
    @Optional() public ngIntercom?: Intercom,
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

  onSignin(userCredential: UserCredential) {
    this.updateIntercom(userCredential);
  }

  onSignup(userCredential: UserCredential) {
    this.updateIntercom(userCredential);
  }

  /**
   * @description function that gets triggered when
   * AuthService.signOut is called
   */
  async onSignout() {
    // Keep cookieConsent in localStorage
    const gdpr = localStorage.getItem('gdpr');
    localStorage.clear();
    localStorage.setItem('gdpr', gdpr);

    this.ngIntercom?.shutdown();
    sessionStorage.clear();
    this.notifications.remove();
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
  public createProfile(user: Partial<User>, ctx: { firstName: string, lastName: string, _meta: DocumentMeta<Date> }) {
    return {
      _meta: createDocumentMeta(ctx._meta),
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
    const user: PublicUser = await f({ email, orgName, app }).toPromise();

    return createUser(user);
  }

  public async getPrivacyPolicy() {
    const { ip } = await this.http.get<{ ip: string }>(`https://api.ipify.org/?format=json`).toPromise();
    return {
      date: new Date(),
      ip: ip
    }
  }

  private updateIntercom(userCredential: UserCredential) {
    const { intercom } = this.gdprService.cookieConsent;
    if (!intercom || !intercomId) return;

    this.db.doc<User>(`users/${userCredential.user.uid}`).valueChanges().pipe(take(1)).subscribe(user => {
      this.ngIntercom?.update(getIntercomOptions(user));
    });
  }
}
