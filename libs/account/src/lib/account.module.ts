import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountWidgetComponent } from './account-widget/account-widget.component';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@blockframes/auth';

// Material
import { MatMenuModule, MatListModule, MatIconModule } from '@angular/material';

export const accountRoutes: Routes = [
  {
    path: 'profile',
    component: AccountProfileComponent,
    canActivate: [AuthGuard],
    data: { fallback: '', org: null }
  }
];

@NgModule({
  imports: [
    CommonModule,
    MatMenuModule,
    MatListModule,
    MatIconModule,
    RouterModule.forChild(accountRoutes)
  ],
  entryComponents: [AccountWidgetComponent, AccountProfileComponent],
  declarations: [AccountWidgetComponent, AccountProfileComponent],
  exports: [AccountWidgetComponent, AccountProfileComponent]
})
export class AccountModule {}
