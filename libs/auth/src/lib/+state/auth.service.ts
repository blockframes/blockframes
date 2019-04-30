import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthStore, User, createUser } from './auth.store';
import { switchMap, takeWhile } from 'rxjs/operators';
import { RelayerWallet } from '@blockframes/ethers';
import { MatSnackBar } from '@angular/material';
import { toASCII } from 'punycode';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private store: AuthStore,
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private wallet: RelayerWallet,
    private snackBar: MatSnackBar
  ) {}

  //////////
  // AUTH //
  //////////
  public async signin(mail: string, password: string) {
    await this.afAuth.auth.signInWithEmailAndPassword(mail, password);
    this.subscribeOnUser();
    const username = mail.split('@')[0];
    this.wallet.login(this._sanitizeUSername(username), password);  // no await -> do the job in background
    const balance = await this.wallet.getBalance();
    this.store.updateUser({balance});
  }

  public async signup(mail: string, password: string) {
    this.store.update({isEncrypting: true});
    const userCredentials = await this.afAuth.auth.createUserWithEmailAndPassword(mail, password);
    await this.create(userCredentials.user);
    this.subscribeOnUser();
    const username = mail.split('@')[0];
    this.snackBar.open('We are curently encrypting your key pair, DO NOT CLOSE THIS PAGE BEFORE THE ENCRYPTION HAS ENDED !', 'OK', {
      duration: 10000,
    });
    this.wallet.signup(userCredentials.user.uid, this._sanitizeUSername(username), password).then(async () => {  // no await -> do the job in background
      const balance = await this.wallet.getBalance();
      this.store.updateUser({balance});
      this.store.update({isEncrypting: false});
      this.snackBar.open('Your key pair has been successfully stored', 'OK', {
        duration: 2000,
      });
    });
  }

  public async logout() {
    await this.afAuth.auth.signOut();
    this.store.update({ user: null });
  }

  //////////
  // USER //
  //////////
  /** Listen on user changes */
  public subscribeOnUser() {
    this.afAuth.authState.pipe(
      takeWhile(user => !!user),
      switchMap(({ uid }) => this.db.doc<User>(`users/${uid}`).valueChanges())
    ).subscribe(user => this.store.update({ user }))
  }

  /** Create a user based on firebase user */
  public create({ email, uid }: firebase.User) {
    const user = createUser({ email, uid })
    return this.db.doc<User>(`users/${uid}`).set(user);
  }

  /** Upate a user */
  public update(uid: string, user: Partial<User>) {
    return this.db.doc<User>(`users/${uid}`).update(user);
  }

  /** Delete the current User */
  public async delete() {
    const uid = this.afAuth.auth.currentUser.uid;

    await this.store.update({ user: null });
    await this.afAuth.auth.currentUser.delete();
    await this._deleteSubCollections(uid);
    await this.db.doc<User>(`users/${uid}`).delete();
  }

  /** Deletes user subCollections */
  private async _deleteSubCollections (uid) {
    // @todo check if user is the only member of org (and the only ADMIN)
    // @todo remove uid from org.userIds
    const orgRights = await this._getUserSubcollectionItems(uid, 'orgRights');
    return await orgRights.map(o => this.db.doc<User>(`users/${uid}`)
      .collection('orgRights')
      .doc(o.id)
      .delete()
    );
  }

  /** Returns promise of subcollection[] */
  private async _getUserSubcollectionItems(uid, collectionName) {
    const items = await this.db.doc<User>(`users/${uid}`)
      .collection(collectionName)
      .get()
      .toPromise();
    return items.docs;
  }

  /** Sanitize username : convert to lowe rcase punycode and replace special chars by their ASCII code
   * @example `漢micHel+9` -> `xn--michel439-2c2s`
   */
  private _sanitizeUSername(username: string) {
    return toASCII(username).toLowerCase()
      .split('')
      .map(char => /[^\w\d-.]/g.test(char) ? char.charCodeAt(0) : char) // replace every non a-z or 0-9 chars by their ASCII code : '?' -> '63'
      .join('');
  }
}
