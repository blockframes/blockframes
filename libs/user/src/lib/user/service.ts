import { Injectable } from '@angular/core';
import { User } from '@blockframes/model';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { deleteDoc, getDoc, updateDoc, doc } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class UserService extends BlockframesCollection<User> {
  readonly path = 'users';

  /**
   * Check if uid is exists in blockframesAdmin collection.
   * If document exists, user is blockframeAdmin.
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
