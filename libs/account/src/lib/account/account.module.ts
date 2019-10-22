import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const accountRoutes: Routes = [
  { path: '',
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', loadChildren: '../profile/profile.module#ProfileModule' },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(accountRoutes),
  ]
})
export class AccountModule {}
