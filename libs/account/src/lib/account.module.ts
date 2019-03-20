import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountWidgetComponent } from './account-widget/account-widget.component';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { AccountViewComponent } from './account-view/account-view.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@blockframes/auth';

// Material
import { 
  MatButtonModule,
  MatInputModule,
  MatMenuModule,
  MatListModule,
  MatIconModule,
  MatFormFieldModule,
  MatCardModule,
  MatExpansionModule
} from '@angular/material';

export const accountRoutes: Routes = [
  {
    path: 'profile',
    component: AccountProfileComponent,
    canActivate: [AuthGuard],
    data: { fallback: '', org: null }
  },
  {
    path: '',
    component: AccountViewComponent,
    canActivate: [AuthGuard],
    data: { fallback: '', org: null }
  }
];

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatMenuModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatExpansionModule,
    RouterModule.forChild(accountRoutes)
  ],
  entryComponents: [AccountWidgetComponent, AccountProfileComponent, AccountViewComponent],
  declarations: [AccountWidgetComponent, AccountProfileComponent, AccountViewComponent],
  exports: [AccountWidgetComponent, AccountProfileComponent, AccountViewComponent]
})
export class AccountModule {}
