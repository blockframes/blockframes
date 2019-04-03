import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthStore, User, createUser } from './auth.store';
import { switchMap, takeWhile } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private store: AuthStore,
    private afAuth: AngularFireAuth,
    private db: AngularFirestore
  ) {}

  //////////
  // AUTH //
  //////////
  public async signin(mail: string, pwd: string) {
    await this.afAuth.auth.signInWithEmailAndPassword(mail, pwd);
    this.subscribeOnUser();
  }

  public async signup(mail: string, pwd: string) {
    const user = await this.afAuth.auth.createUserWithEmailAndPassword(mail, pwd);
    await this.create(user.user);
    this.subscribeOnUser();
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
