import { Inject, Injectable, NgZone, Optional } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { FireAuthService, CollectionConfig, FireAuthState, RoleState, initialAuthState } from 'akita-ng-fire';
import { map, switchMap, take, tap } from 'rxjs/operators';
import {
  createUser,
  PublicUser,
  User,
  PrivacyPolicy,
  createDocumentMeta,
  DocumentMeta,
  Timestamp,
  App,
  AnonymousCredentials,
  AnonymousRole,
} from '@blockframes/model';
import { Intercom } from 'ng-intercom';
import { getIntercomOptions } from '@blockframes/utils/intercom/intercom.service';
import { GDPRService } from '@blockframes/utils/gdpr-cookie/gdpr-service/gdpr.service';
import { intercomId, production } from '@env';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { getBrowserWithVersion } from '@blockframes/utils/browser/utils';
import { IpService } from '@blockframes/utils/ip';
import { OrgEmailData } from '@blockframes/utils/emails/utils';
import { getAnalytics, setUserProperties } from '@angular/fire/analytics';
import {
  Auth,
  confirmPasswordReset,
  EmailAuthProvider,
  getAuth,
  linkWithCredential,
  signInAnonymously,
  updatePassword,
  User as FireUser,
  user,
  UserCredential,
  verifyPasswordResetCode
} from '@angular/fire/auth';
import { UserService } from '@blockframes/user/+state';
import { Store, StoreConfig } from '@datorama/akita';
import { APP } from '@blockframes/utils/routes/utils';
import { doc, docData, getDoc, DocumentReference, writeBatch } from '@angular/fire/firestore';
import { ErrorResultResponse } from '@blockframes/utils/utils';
import { runInZone } from '@blockframes/utils/zone';

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'auth' })
class AuthStore extends Store<AuthState> {
  constructor() {
    super(initialAuthState);
  }

}

interface Roles { blockframesAdmin: boolean }

interface AuthState extends FireAuthState<User>, RoleState<Roles> { }

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users', idKey: 'uid' })
export class AuthService extends FireAuthService<AuthState> {
  signedOut = new Subject<void>();
  anonymousCredentials$ = new BehaviorSubject<AnonymousCredentials>(this.anonymousCredentials);

  // For these to be defined, one of the observable below must be called before
  profile: User; // User object in Firestore DB
  uid: string; // Will be defined for regular and anonymous users

  // Firebase Auth User Object
  user$ = user(this.afAuth).pipe(tap(auth => {
    this.uid = auth?.uid;
    if (!auth?.uid) this.profile = undefined;
  }));

  // Firebase Auth User Object and User object in Firestore DB (profile)
  auth$: Observable<{ uid: string, isAnonymous: boolean, emailVerified: boolean, profile?: User }> = this.user$.pipe(
    switchMap(authState => {
      if (!authState || authState.isAnonymous) return of(undefined).pipe(map(() => [undefined, authState]));
      return this.userService.valueChanges(authState.uid).pipe(map(profile => [profile, authState]));
    }),
    runInZone(this.ngZone), // TODO #7595 #7273
    map(([profile, userAuth]: [User, FireUser]) => {
      if (!userAuth) return;

      // TODO #6113 once we have a custom email verified page, we can update the users' meta there
      if (userAuth?.emailVerified && profile && !profile._meta?.emailVerified) {
        const _meta: DocumentMeta<Date | Timestamp> = {
          ...profile._meta,
          emailVerified: true
        }
        this.userService.update(userAuth.uid, { _meta });
      }

      const { isAnonymous, emailVerified } = userAuth;
      return {
        uid: userAuth.uid,
        isAnonymous,
        emailVerified,
        profile
      }
    }),
    tap(auth => {
      this.uid = auth?.uid;
      this.profile = auth?.profile;
    })
  );

  isBlockframesAdmin$ = this.user$.pipe(
    switchMap(user => {
      if (!user || user.isAnonymous) return of(false);
      const ref = doc(this.db, `blockframesAdmin/${user.uid}`);
      return getDoc(ref).then(snap => snap.exists());
    })
  );

  // User object in Firestore DB
  profile$ = this.auth$.pipe(map(auth => auth?.profile));

  get anonymouseOrRegularProfile() { return this.profile || this.anonymousCredentials };

  constructor(
    protected store: AuthStore,
    private functions: Functions,
    private gdprService: GDPRService,
    private ipService: IpService,
    private afAuth: Auth,
    private userService: UserService,
    private ngZone: NgZone,
    @Inject(APP) private app: App,
    @Optional() public ngIntercom?: Intercom,
  ) {
    super(store);
    if (!production && window['Cypress']) window['LoginService'] = this;    // instrument Cypress only out of PROD
  }

  //////////
  // AUTH //
  //////////

  /**
   * Initiate the password reset process for this user.
   * @param email email of the user
  */
  public resetPasswordInit(email: string, app: App = this.app) {
    const callSendReset = httpsCallable<{ email: string, app: App }, ErrorResultResponse>(this.functions, 'sendResetPasswordEmail');
    return callSendReset({ email, app });
  }

  public checkResetCode(actionCode: string) {
    return verifyPasswordResetCode(this.auth, actionCode);
  }

  onSignin(userCredential: UserCredential) {
    this.updateIntercom(userCredential);
    const analytics = getAnalytics();
    setUserProperties(analytics, getBrowserWithVersion());
  }

  onSignup(userCredential: UserCredential) {
    this.updateIntercom(userCredential);
  }

  /**
   * Force reload of current user state
   * @returns firebase.User
   */
  async reloadUser() {
    const currentUser = await this.afAuth.currentUser;
    await currentUser.reload();
    return this.afAuth.currentUser;
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
    const user = await this.afAuth.currentUser;
    return updatePassword(user, newPassword);
  }

  /**
   * Set a new password after it has been resetted.
   * @param actionCode specific code from Firebase to check the user
   * @param newPassword new password set by the owned of email
   */
  public handleResetPassword(actionCode: string, newPassword: string) {
    confirmPasswordReset(this.afAuth, actionCode, newPassword);
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
  public async createUser(email: string, orgEmailData: OrgEmailData, app: App = this.app): Promise<PublicUser> {
    const f = httpsCallable(this.functions, 'createUser');
    const user = await f({ email, orgEmailData, app }) as unknown;
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

    const ref = doc(this.db, `users/${userCredential.user.uid}`) as DocumentReference<User>;
    docData<User>(ref).pipe(take(1)).subscribe(user => {
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
    const currentUser = await this.afAuth.currentUser;
    if (currentUser) {
      return this.updateAnonymousCredentials({ uid: currentUser.uid });
    }

    const creds = await signInAnonymously(this.afAuth);
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
    const credentials = EmailAuthProvider.credential(email, password);

    const isAnonymous = await this.isSignedInAnonymously();
    if (!isAnonymous) {
      throw new Error('Current user is not anonymous');
    }
    const cred = await linkWithCredential(getAuth().currentUser, credentials);

    const { write = writeBatch(this.db), ctx } = options;
    await this.onSignup(cred);
    const profile = await this.createProfile(cred.user, ctx);
    const ref = doc(this.db, `users/${cred.user.uid}`);
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
    const currentUser = getAuth().currentUser;
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
    return getAuth().currentUser.delete();
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
}


