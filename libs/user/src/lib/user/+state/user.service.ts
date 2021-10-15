import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { UserState, UserStore } from './user.store';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { map } from 'rxjs/operators';
import { User, AuthQuery, AuthStore } from '@blockframes/auth/+state';
import { DocumentMeta } from '@blockframes/utils/models-meta';


@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users' })
export class UserService extends CollectionService<UserState> {
  readonly useMemorization = true;

  public userIds$ = this.organizationQuery.selectActive().pipe(
    map(org => org.userIds)
  );

  constructor(
    protected store: UserStore,
    private authStore: AuthStore,
    private authQuery: AuthQuery,
    private organizationQuery: OrganizationQuery,
  ) {
    super(store);
    this.updateEmailVerified();
  }

  //////////
  // USER //
  // @dev we can replace a lot of these functions by native Akita-ng-fire functions
  // @see https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
  //////////

  /**
   * Check if uid is exists in blockframesAdmin collection.
   * If document exists, user is blockframeAdmin (like an ancient god).
   * @param uid
   */
  public async isBlockframesAdmin(uid: string): Promise<boolean> {
    const snap = await this.db.collection('blockframesAdmin').doc(uid).get().toPromise();
    return snap.exists;
  }

  /**
   * Set/unset user as blockframesAdmin
   * @param state
   * @param uid
   */
  public async setBlockframesAdmin(state: boolean = true, uid: string = this.authQuery.userId): Promise<void> {
    if (state) {
      await this.db.collection('blockframesAdmin').doc(uid).set({});
    } else {
      await this.db.collection('blockframesAdmin').doc(uid).delete();
    }
  }

  /**
   * Checks if an user exists
   * @dev If in the future, we need to keep an user list in the state other than members of an org,
   * this will be the time to create a userService and to move this method in it.
   * @param uid
   */
  public async userExists(uid: string): Promise<boolean> {
    const snap = await this.db.collection('users').doc(uid).get().toPromise();
    return snap.exists;
  }

  /**
   * Fetch an user based on his uid
   * @dev If in the future, we need to keep an user list in the state other than members of an org,
   * this will be the time to create a userService and to move this method in it.
   * @param uid
   */
  public async getUser(uid: string): Promise<User> {
    const user = await this.db.collection('users').doc(uid).get().toPromise();
    return user.data() as User;
  }

  /**
   * @dev since this.update() does not behave like other services
   * (authService extends FireAuthService<AuthState> and others extends CollectionService<XxxState>)
   * This method was created to easily update an user.
   * @param uid
   * @param update
   */
  public async updateById(uid: string, update: Partial<User>) {
    // @TODO (#2090) update org.userIds & permission document if orgId is change for the user
    await this.db.collection('users').doc(uid).update(update);
  }

  /**
   * Fetch all users
   * @dev If in the future, we need to keep an user list in the state other than members of an org,
   * this will be the time to create a userService and to move this method in it.
   */
  public async getAllUsers(): Promise<User[]> {
    const usersSnap = await this.db
      .collection('users')
      .get()
      .toPromise();
    return usersSnap.docs.map(c => c.data() as User);
  }

  // TODO THIS IS A QUICK FIX OF MOVIE FINANCING RANK MADE FOR TORONTO, THINK OF A BETTER WAY AFTERWARD
  //---------------------------
  //   MOVIE FINANCING RANK
  //---------------------------
  public changeRank(rank: string) {
    this.authStore.updateProfile({ financing: { rank } });
  }

  // TODO #6113 nce we have a custom email verified page, we can update the users' meta there
  private async updateEmailVerified() {
    const auth = this.authQuery.getValue();

    if (auth.emailVerified) {
      const user = await this.getValue(auth.uid);
      if (!user._meta?.emailVerified) { // attribute does not exists or is set to false
        const _meta: DocumentMeta<Date | FirebaseFirestore.Timestamp> = {
          ...user._meta,
          emailVerified: true
        }
        this.update(auth.uid, { _meta });
      }
    }
  }
}
