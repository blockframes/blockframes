import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { User, AuthQuery } from '@blockframes/auth/+state';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { EntityState } from '@datorama/akita';

type UserState = EntityState<User>;

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users' })
export class UserService extends CollectionService<UserState> {
  readonly useMemorization = true;

  constructor(
    private authQuery: AuthQuery,
  ) {
    super();
    this.updateEmailVerified();
  }

  /**
   * Check if uid is exists in blockframesAdmin collection.
   * If document exists, user is blockframeAdmin (like an ancient god).
   * @param uid
   */
  public async isBlockframesAdmin(uid: string): Promise<boolean> {
    if(!uid) return false;
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
   * Fetch an user based on his uid
   * @dev If in the future, we need to keep an user list in the state other than members of an org,
   * this will be the time to create a userService and to move this method in it.
   * @param uid
   */
  public async getUser(uid: string): Promise<User> { // @TODO #7286 remove and use this.getValue(uid)
    const user = await this.db.collection('users').doc(uid).get().toPromise();
    return user.data() as User;
  }

  /**
   * @param uid
   * @param user
   */
  public async updateById(uid: string, user: Partial<User>) { 
    await this.update(uid, user);// @TODO #7286 test
  }

  // TODO #6113 once we have a custom email verified page, we can update the users' meta there
  // #7303 if user does not interact with userService, this is not updated (ie: user goes directly to eventPage)
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
