import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AccountWidgetComponent } from './account-widget/account-widget.component';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { AccountViewComponent } from './account-view/account-view.component';
import { AccountDeleteComponent } from './account-delete/account-delete.component';
import { RouterModule, Routes } from '@angular/router';
import { BlockieModule } from '../../../ui/src/lib/blockie/blockie.module';
import { WalletModule, AskPasswordComponent } from '@blockframes/ethers';

import { FlexLayoutModule } from '@angular/flex-layout';
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
  MatTooltipModule,
  MatProgressSpinnerModule,
  MatProgressBarModule
} from '@angular/material';

export const accountRoutes: Routes = [
  {
    path: 'profile',
    component: AccountProfileComponent
  },
  {
    path: '',
    component: AccountViewComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    WalletModule,
    FlexLayoutModule,
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
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    FormsModule,
    RouterModule.forChild(accountRoutes),
    BlockieModule
  ],
  entryComponents: [
    AccountWidgetComponent,
    AccountProfileComponent,
    AccountViewComponent,
    AccountDeleteComponent,
    AskPasswordComponent
  ],
  declarations: [
    AccountWidgetComponent,
    AccountProfileComponent,
    AccountViewComponent,
    AccountDeleteComponent
  ],
  exports: [
    AccountWidgetComponent,
    AccountProfileComponent,
    AccountViewComponent,
    AccountDeleteComponent
  ]
})
export class AccountModule {}
