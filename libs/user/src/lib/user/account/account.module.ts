import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActiveDaoGuard } from '@blockframes/organization/guard/active-dao.guard';

// TODO issue#1146
import { AFM_DISABLE } from '@env';

export const accountRoutes: Routes = [
  { path: '',
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', loadChildren: () => import('../profile/profile.module').then(m => m.ProfileModule) },
      {
        path: 'wallet',
        canActivate: [ActiveDaoGuard],
        loadChildren: () => import('@blockframes/ethers').then(m => m.WalletModule)
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(accountRoutes),
  ]
})
export class AccountModule {}
