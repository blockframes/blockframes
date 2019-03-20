import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AccountWidgetComponent } from './account-widget/account-widget.component';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { AccountViewComponent } from './account-view/account-view.component';
import { AccountDeleteComponent } from './account-delete/account-delete.component';
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
  MatExpansionModule,
  MatDialogModule,
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
    MatDialogModule,
    FormsModule,
    RouterModule.forChild(accountRoutes)
  ],
  entryComponents: [AccountWidgetComponent, AccountProfileComponent, AccountViewComponent, AccountDeleteComponent],
  declarations: [AccountWidgetComponent, AccountProfileComponent, AccountViewComponent, AccountDeleteComponent],
  exports: [AccountWidgetComponent, AccountProfileComponent, AccountViewComponent, AccountDeleteComponent]
})
export class AccountModule {}
