import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthStore, User, createUser } from './auth.store';
import { switchMap, takeWhile} from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private store: AuthStore,
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private snackBar: MatSnackBar
  ) {}

  //////////
  // AUTH //
  //////////

  // public async initWallet(email: string) { // TODO MOVE IN WALLET ISSUE #315
  //   this.wallet.setUsername(email);
  //   this.refreshBalance();
  // }

  public async signin(email: string, password: string) {
    await this.afAuth.auth.signInWithEmailAndPassword(email, password);
    this.subscribeOnUser();

     // TODO MOVE IN WALLET ISSUE #315
    // this.initWallet(email);
    // this.wallet.loadKey('web', password);  // no await -> do the job in background
  }

  public async signup(email: string, password: string) {
    // this.store.update({isEncrypting: true});
    // this.snackBar.open('We are curently encrypting your key pair, DO NOT CLOSE THIS PAGE BEFORE THE ENCRYPTION HAS ENDED !', 'OK', {
    //   duration: 10000,
    // });

    const userCredentials = await this.afAuth.auth.createUserWithEmailAndPassword(email, password);
    await this.create(userCredentials.user);

     // TODO MOVE IN WALLET ISSUE #315
    // this.wallet.createLocalKey('web', password, email)  // no await -> do the job in background
    // .then(() => this.wallet.createERC1077(userCredentials.user.uid))
    // .then(() => {
    //   this.subscribeOnUser();
      this.store.update({isEncrypting: false});
    //   this.snackBar.open('Your key pair has been successfully stored', 'OK', {
    //     duration: 2000,
    //   });
    // }).catch(error => console.error(error));
  }

  public async logout() {
    // this.wallet.logout(); // TODO MOVE IN WALLET ISSUE #315
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
      switchMap(({ uid }) => this.db.doc<User>(`users/${uid}`).valueChanges()),
    ).subscribe(user => {
      this.store.update({ user });
      // this.initWallet(user.email); // TODO MOVE IN WALLET ISSUE #315
    });
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

  // public async refreshBalance() { // TODO MOVE IN WALLET ISSUE #315
  //   this.store.update({isBalanceLoading: true});
  //   const balance = await this.wallet.getBalance();
  //   this.store.updateUser({balance});
  //   this.store.update({isBalanceLoading: false});
  // }

  // public async requestTokens(amount: number) { // TODO MOVE IN WALLET ISSUE #315
  //   this.store.update({isBalanceLoading: true});
  //   try {
  //     await this.wallet.requestTokens(amount);
  //     this.refreshBalance();
  //   } catch(error) {
  //     console.error('Request Tokens FAILED because of :',error);
  //     this.store.update({isBalanceLoading: false});
  //   }
  // }

  // public async signDelivery(deliveryId: string, stakeholderId: string) { // TODO MOVE IN WALLET ISSUE #315
  //   return this.wallet.signDelivery(deliveryId, stakeholderId);
  // }

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
}
