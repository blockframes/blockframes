import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthStore, User, createUser } from './auth.store';
import { switchMap, takeWhile } from 'rxjs/operators';
import { RelayerWallet } from '@blockframes/ethers';
import { MatSnackBar } from '@angular/material';

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
    this.wallet.login(username, password);  // no await -> do the job in background
  }

  public async signup(mail: string, password: string) {
    this.store.update({isEncrypting: true});
    const user = await this.afAuth.auth.createUserWithEmailAndPassword(mail, password);
    await this.create(user.user);
    this.subscribeOnUser();
    const username = mail.split('@')[0];
    this.wallet.signup(user.user.uid, username, password).then(() => {  // no await -> do the job in background
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
    this.store.update({ user: null });
    await this.afAuth.auth.currentUser.delete();
    await this.db.doc<User>(`users/${uid}`).delete();
  }
}
