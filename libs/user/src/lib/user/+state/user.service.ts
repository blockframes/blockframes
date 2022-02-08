import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { EntityState } from '@datorama/akita';
import { User } from './user.firestore';

type UserState = EntityState<User>;

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users' })
export class UserService extends CollectionService<UserState> {
  readonly useMemorization = true;

  /**
   * Check if uid is exists in blockframesAdmin collection.
   * If document exists, user is blockframeAdmin (like an ancient god).
   * @param uid
   */
  public async isBlockframesAdmin(uid: string): Promise<boolean> {
    if (!uid) return false;
    const snap = await this.db.collection('blockframesAdmin').doc(uid).get().toPromise();
    return snap.exists;
  }

  /**
   * Set/unset user as blockframesAdmin
   * @param state
   * @param uid
   */
  public async setBlockframesAdmin(state: boolean = true, uid: string): Promise<void> {
    if (state) {
      await this.db.collection('blockframesAdmin').doc(uid).set({});
    } else {
      await this.db.collection('blockframesAdmin').doc(uid).delete();
    }
  }

  /**
   * Fetch an user based on his uid
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
}
