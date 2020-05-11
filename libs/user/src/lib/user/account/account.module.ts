import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { ActiveDaoGuard } from '@blockframes/organization/guard/active-dao.guard';

export const accountRoutes: Routes = [
  { path: '',
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', loadChildren: () => import('../user-display.module').then(m => m.UserDisplayModule) },
      // 25/03/20 We comment this path, since we don't use it anymore but it can be used later
      // {
      //   path: 'wallet',
      //   canActivate: [ActiveDaoGuard],
      //   loadChildren: () => import('@blockframes/ethers/wallet/wallet.module').then(m => m.WalletModule)
      // }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(accountRoutes),
  ]
})
export class AccountModule {}
