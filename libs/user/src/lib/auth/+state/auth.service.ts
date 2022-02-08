import { Injectable, Optional } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import firebase from 'firebase/app';
import { UserCredential } from '@firebase/auth-types';
import { FireAuthService, CollectionConfig, FireAuthState, RoleState, initialAuthState } from 'akita-ng-fire';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { map, switchMap, take, withLatestFrom } from 'rxjs/operators';
import { getCurrentApp, App } from '@blockframes/utils/apps';
import { PublicUser, User, PrivacyPolicy } from '@blockframes/user/types';
import { Intercom } from 'ng-intercom';
import { getIntercomOptions } from '@blockframes/utils/intercom/intercom.service';
import { GDPRService } from '@blockframes/utils/gdpr-cookie/gdpr-service/gdpr.service';
import { intercomId, production } from '@env';
import { createDocumentMeta, DocumentMeta } from '@blockframes/utils/models-meta';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { getBrowserWithVersion } from '@blockframes/utils/browser/utils';
import { IpService } from '@blockframes/utils/ip';
import { OrgEmailData } from '@blockframes/utils/emails/utils';
import { AnonymousCredentials, AnonymousRole } from './auth.model';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from '@blockframes/user/+state';
import { createStorageFile } from '@blockframes/media/+state/media.firestore';
import { Store, StoreConfig } from '@datorama/akita';

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'auth' })
class AuthStore extends Store<AuthState> {
  constructor() {
    super(initialAuthState);
  }

}

export function createUser(user: Partial<User> = {}) { // @TODO #7286 move to model ? or userModel ?
  return {
    ...user,
    avatar: createStorageFile(user.avatar)
  } as User;
}

interface Roles { blockframesAdmin: boolean }

interface AuthState extends FireAuthState<User>, RoleState<Roles> { }

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users', idKey: 'uid' })
export class AuthService extends FireAuthService<AuthState> {
  signedOut = new Subject<void>();
  anonymousCredentials$ = new BehaviorSubject<AnonymousCredentials>(this.anonymousCredentials);

  uid: string; // @TODO #7286 use this instead of this.authService.profile.uid || this.authService.anonymousUserId ?

  auth$: Observable<Partial<AuthState>> = this.afAuth.authState.pipe( // @TODO #7286 find a better typing
    switchMap(authState => authState && !authState.isAnonymous ? this.userService.valueChanges(authState.uid) : of(undefined)), // @TODO #7286 check if change when lastname is changed
    withLatestFrom(this.afAuth.authState),
    switchMap(async ([user, authState]: [User, firebase.User]) => {
      if (!authState) return undefined;
      const token = await authState?.getIdToken(); // @TODO 7286 useful ?
      this.profile = user;
      this.uid = authState.uid;
      return {
        uid: authState.uid, // Will be populated even if user is anonymous
        token,
        isAnonymous: authState.isAnonymous || false,
        emailVerified: authState.emailVerified || false,
        profile: user,
      }
    })
  );

  isBlockframesAdmin$ = this.afAuth.authState.pipe(
    switchMap(async user => {
      if (!user) return false;
      const snap = await this.db.collection('blockframesAdmin').doc(user.uid).get().toPromise();
      return snap.exists;
    })
  );

  profile$ = this.auth$.pipe(
    map(authState => authState?.profile)
  );

  profile: User; // @TODO #7273 if auth$ was not already called, this will be undefined

  constructor(
    protected store: AuthStore,
    private functions: AngularFireFunctions,
    private routerQuery: RouterQuery,
    private gdprService: GDPRService,
    private analytics: AngularFireAnalytics,
    private ipService: IpService,
    private afAuth: AngularFireAuth, // @TODO #7278 don't use this.auth directly as this belongs to akita-ng-fire
    private userService: UserService,
    @Optional() public ngIntercom?: Intercom,
  ) {
    super(store);
    if (!production) { // instrument Cypress only out of PROD
      if (window['Cypress']) {
        window['LoginService'] = this
      }
    }

    this.updateEmailVerified();
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
    const { intercom } = this.gdprService.cookieConsent;
    if (intercom && intercomId) this.ngIntercom.boot({ app_id: intercomId });

    sessionStorage.clear();
    this.signedOut.next();
  }

  /**
   * Update the user password with a new one.
   * @param currentPassword current password of the user
   * @param newPassword new password set by the user
   */
  public async updatePassword(currentPassword: string, newPassword: string, email = this.profile.email) {
    await this.signin(email, currentPassword);
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

  // TODO #6113 once we have a custom email verified page, we can update the users' meta there
  // #7303 if user does not interact with authService, this is not updated (ie: user goes directly to eventPage ?)
  // @TODO #7286 rework this
  private async updateEmailVerified() {
    const auth = await this.auth$.pipe(take(1)).toPromise();

    if (auth?.emailVerified) {
      const user = await this.userService.getValue(auth.uid);
      if (!user._meta?.emailVerified) { // attribute does not exists or is set to false
        const _meta: DocumentMeta<Date | FirebaseFirestore.Timestamp> = {
          ...user._meta,
          emailVerified: true
        }
        this.userService.update(auth.uid, { _meta });
      }
    }
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

  get anonymousCredentials(): AnonymousCredentials { // @7286 rename to anonymousProfile
    return {
      uid: sessionStorage.getItem('anonymousCredentials.uid'),
      lastName: sessionStorage.getItem('anonymousCredentials.lastName'),
      firstName: sessionStorage.getItem('anonymousCredentials.firstName'),
      role: sessionStorage.getItem('anonymousCredentials.role') as AnonymousRole,
      email: sessionStorage.getItem('anonymousCredentials.email'),
      invitationId: sessionStorage.getItem('anonymousCredentials.invitationId'),
    };
  }

  get anonymousUserId() { // @7286 rename to anonymousProfileUid ?
    return this.anonymousCredentials.uid;
  }
}


