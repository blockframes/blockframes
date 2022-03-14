import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { EntityState } from '@datorama/akita';
import { User } from '@blockframes/model';
import { doc } from '@angular/fire/firestore';
import { deleteDoc, getDoc, updateDoc } from 'firebase/firestore';

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
    const ref = doc(this.db, `blockframesAdmin/${uid}`);
    const snap = await getDoc(ref);
    return snap.exists();
  }

  /**
   * Set/unset user as blockframesAdmin
   * @param state
   * @param uid
   */
  public async setBlockframesAdmin(state: boolean = true, uid: string): Promise<void> {
    const ref = doc(this.db, `blockframesAdmin/${uid}`);
    if (state) {
      await updateDoc(ref, {});
    } else {
      await deleteDoc(ref);
    }
  }
}
