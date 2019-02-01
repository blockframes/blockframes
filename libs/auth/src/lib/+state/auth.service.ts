import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthStore, createUser } from './auth.store';
import { map } from 'rxjs/operators';
import { NgWallet } from '@blockframes/ethers';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private store: AuthStore,
    private afAuth: AngularFireAuth,
    private wallet: NgWallet,
    private router: Router,
  ) {
    this.afAuth.authState
      .pipe(map(user => (user ? createUser(user) : null)))
      .subscribe(user => this.store.update({ user }));
  }

  public signin(mail: string, pwd: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(mail, pwd);
  }

  public async signup(mail: string, pwd: string) {
    try {
      await this.afAuth.auth.createUserWithEmailAndPassword(mail, pwd);
      this.wallet.createRandom();
    } catch (err) {
      throw new Error(err);
    }
  }

  public logout() {
    this.afAuth.auth.signOut();
  }
}
