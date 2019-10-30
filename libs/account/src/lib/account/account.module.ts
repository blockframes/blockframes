import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// TODO issue#1146
import { AFM_DISABLE } from '@env';

export const accountRoutes: Routes = [
  { path: '',
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', loadChildren: () => import('../profile/profile.module').then(m => m.ProfileModule) },
    ]
  }
];

// TODO issue#1146
if (AFM_DISABLE) {
  accountRoutes[0].children.push(
    { path: 'wallet', loadChildren: () => import('@blockframes/ethers').then(m => m.WalletModule) }
  );
}

@NgModule({
  imports: [
    RouterModule.forChild(accountRoutes),
  ]
})
export class AccountModule {}
