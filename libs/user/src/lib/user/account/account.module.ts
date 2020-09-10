import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { ActiveDaoGuard } from '@blockframes/organization/guard/active-dao.guard';

export const accountRoutes: Routes = [
  { path: '',
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', loadChildren: () => import('../user-display.module').then(m => m.UserDisplayModule) },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(accountRoutes),
  ]
})
export class AccountModule {}
