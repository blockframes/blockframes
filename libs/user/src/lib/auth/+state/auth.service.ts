import { Injectable, Optional } from '@angular/core';
import { AuthStore, User, AuthState, createUser } from './auth.store';
import { AuthQuery } from './auth.query';
import { AngularFireFunctions } from '@angular/fire/functions';
import firebase from 'firebase';
import { UserCredential } from '@firebase/auth-types';
import { FireAuthService, CollectionConfig } from 'akita-ng-fire';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { map, take } from 'rxjs/operators';
import { getCurrentApp, App } from '@blockframes/utils/apps';
import { PublicUser, PrivacyPolicy } from '@blockframes/user/types';
import { Intercom } from 'ng-intercom';
import { getIntercomOptions } from '@blockframes/utils/intercom/intercom.service';
import { GDPRService } from '@blockframes/utils/gdpr-cookie/gdpr-service/gdpr.service';
import { intercomId } from '@env';
import { createDocumentMeta, DocumentMeta } from '@blockframes/utils/models-meta';
import { BehaviorSubject, Subject } from 'rxjs';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { getBrowserWithVersion } from '@blockframes/utils/browser/utils';
import { IpService } from '@blockframes/utils/ip';
import { OrgEmailData } from '@blockframes/utils/emails/utils';
import { AnonymousCredentials, AnonymousRole } from './auth.model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users', idKey: 'uid' })
export class AuthService extends FireAuthService<AuthState> {
  signedOut = new Subject<void>();
  anonymousCredentials$ = new BehaviorSubject<AnonymousCredentials>(this.anonymousCredentials);

  constructor(
    protected store: AuthStore,
    private query: AuthQuery,
    private functions: AngularFireFunctions,
    private routerQuery: RouterQuery,
    private gdprService: GDPRService,
    private analytics: FireAnalytics,
    private ipService: IpService,
    @Optional() public ngIntercom?: Intercom,
  ) {
    super(store);
  }

  /**
   * @dev This populates the RoleState part of the AuthState.
   * Used to check if logged in user is blockframesAdmin or not.
   */
  selectRoles(user: firebase.User) {
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
  public resetPasswordInit(email: string, app: App = getCurrentApp(this.routerQuery)) {
    const callSendReset = this.functions.httpsCallable('sendResetPasswordEmail');
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

    this.analytics.setUserProperties(getBrowserWithVersion());
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
    this.signedOut.next();
  }

  /**
   * Update the user password with a new one.
   * @param currentPassword current password of the user
   * @param newPassword new password set by the user
   */
  public async updatePassword(currentPassword: string, newPassword: string, email = this.query.user.email) {
    try {
      await this.signin(email, currentPassword);
    } catch (error) {
      throw error;
    }
    const user = await this.user;
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
  public createProfile(user: Partial<User>, ctx: {
    firstName: string,
    lastName: string,
    _meta: DocumentMeta<Date>,
    privacyPolicy: PrivacyPolicy
  }) {
    return {
      _meta: createDocumentMeta({ emailVerified: false, ...ctx._meta }),
      uid: user.uid,
      email: user.email,
      firstName: ctx.firstName,
      lastName: ctx.lastName,
      privacyPolicy: ctx.privacyPolicy,
    };
  }

  /**
   * Call a backend function to create a new user
   * Reserved to blockframes admins only
   * @param email
   * @param orgName
   * @param app
   */
  public async createUser(email: string, orgEmailData: OrgEmailData, app: App = getCurrentApp(this.routerQuery)): Promise<PublicUser> {
    const f = this.functions.httpsCallable('createUser');
    const user: PublicUser = await f({ email, orgEmailData, app }).toPromise();

    return createUser(user);
  }

  public async getPrivacyPolicy(): Promise<PrivacyPolicy> {
    return {
      date: new Date(),
      ip: await this.ipService.get()
    }
  }

  private updateIntercom(userCredential: UserCredential) {
    const { intercom } = this.gdprService.cookieConsent;
    if (!intercom || !intercomId) return;

    this.db.doc<User>(`users/${userCredential.user.uid}`).valueChanges().pipe(take(1)).subscribe(user => {
      this.ngIntercom?.update(getIntercomOptions(user));
    });
  }

  ////////////////////
  // ANONYMOUS AUTH //
  ////////////////////

  /**
   * Sign in an user anonymously if not already connected,
   * he will get an uid and will be stored in firebase auth as anonymous
   * @returns Promise<AnonymousCredentials>
   */
  async signInAnonymously() {
    const currentUser = await this.user;
    if (currentUser) {
      return this.updateAnonymousCredentials({ uid: currentUser.uid });
    }

    const creds = await this.auth.signInAnonymously();
    return this.updateAnonymousCredentials({ uid: creds.user.uid }, { reset: true });
  }

  /**
   * Takes an anonymous user and convert it to a real one with email and password.
   * This keeps the same uid
   * @param email 
   * @param password 
   * @param options 
   * @returns Promise<firebase.auth.UserCredential>
   */
  async signupFromAnonymous(email: string, password: string, options: any = {}) {
    const credentials = firebase.auth.EmailAuthProvider.credential(email, password);

    const isAnonymous = await this.isSignedInAnonymously();
    if (!isAnonymous) {
      throw new Error('Current user is not anonymous');
    }
    const cred = await firebase.auth().currentUser.linkWithCredential(credentials);

    const { write = this.db.firestore.batch(), ctx } = options;
    await this.onSignup(cred);
    const profile = await this.createProfile(cred.user, ctx);
    const { ref } = this.db.collection('users').doc(cred.user.uid);
    write.set(ref, profile);
    if (!options.write) {
      await write.commit();
    }

    return cred;
  }

  /**
   * Check if current user is logged-in anonymously
   * @returns Promise<boolean>
   */
  async isSignedInAnonymously() {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) return false;
    const { signInProvider } = await currentUser.getIdTokenResult();
    return signInProvider === 'anonymous';
  }

  /**
   * Deletes anonymous user (+ signOut) or performs a regular signOut
   * @returns Promise<void>
   */
  async deleteAnonymousUserOrSignOut() {
    const isAnonymous = await this.isSignedInAnonymously();
    if (isAnonymous) {
      return this.deleteAnonymousUser();
    } else {
      return this.signOut();
    }
  }

  /**
   * Deletes and signOut an anonymous user
   * @returns Promise<void>
   */
  async deleteAnonymousUser() {
    const isAnonymous = await this.isSignedInAnonymously();
    if (!isAnonymous) return false;
    // Clean anonymousCredentials
    await this.onSignout();
    // Delete (and logout) user
    return firebase.auth().currentUser.delete();
  }

  private resetAnonymousCredentials() {
    const keys = ['uid', 'role', 'email', 'invitationId', 'lastName', 'firstName'];  // keys of AnonymousCredentials
    keys.forEach(k => sessionStorage.removeItem(`anonymousCredentials.${k}`));
  }

  updateAnonymousCredentials(creds: Partial<AnonymousCredentials>, options?: { reset: boolean }) {

    if (options?.reset) {
      this.resetAnonymousCredentials();
    }

    for (const [key, value] of Object.entries(creds)) {
      !value ? sessionStorage.removeItem(`anonymousCredentials.${key}`) : sessionStorage.setItem(`anonymousCredentials.${key}`, value as string);
    }

    this.anonymousCredentials$.next(this.anonymousCredentials);

    return this.anonymousCredentials;
  }

  get anonymousCredentials(): AnonymousCredentials {
    return {
      uid: sessionStorage.getItem('anonymousCredentials.uid'),
      lastName: sessionStorage.getItem('anonymousCredentials.lastName'),
      firstName: sessionStorage.getItem('anonymousCredentials.firstName'),
      role: sessionStorage.getItem('anonymousCredentials.role') as AnonymousRole,
      email: sessionStorage.getItem('anonymousCredentials.email'),
      invitationId: sessionStorage.getItem('anonymousCredentials.invitationId'),
    };
  }

  get anonymousUserId() {
    return this.anonymousCredentials.uid;
  }
}


