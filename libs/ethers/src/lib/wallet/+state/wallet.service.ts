import { Injectable } from '@angular/core';
import { WalletStore } from './wallet.store';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private store: WalletStore
  ) {}

  // public async initWallet(email: string) { // TODO MOVE IN WALLET ISSUE #315
  //   this.wallet.setUsername(email);
  //   this.refreshBalance();
  // }

  // public async signin(email: string, password: string) {

     // TODO MOVE IN WALLET ISSUE #315
    // this.initWallet(email);
    // this.wallet.loadKey('web', password);  // no await -> do the job in background
  // }

  // public async createWallet(email: string, password: string) {
     // TODO MOVE IN WALLET ISSUE #315
    // this.wallet.createLocalKey('web', password, email)  // no await -> do the job in background
    // .then(() => this.wallet.createERC1077(userCredentials.user.uid))
    // .then(() => {
    //   this.subscribeOnUser();
    //   this.store.update({isEncrypting: false});
    //   this.snackBar.open('Your key pair has been successfully stored', 'OK', {
    //     duration: 2000,
    //   });
    // }).catch(error => console.error(error));
  // }

  // public async logout() {
    // this.wallet.logout(); // TODO MOVE IN WALLET ISSUE #315
  // }

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
}
