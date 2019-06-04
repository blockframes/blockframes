import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatInputModule,
  MatFormFieldModule,
  MatButtonModule,
  MatSnackBarModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatDialogModule,
  MatMenuModule,
  MatCardModule,
} from '@angular/material';

import { BlockieModule } from '@blockframes/ui';
import { KeyManagerModule } from '../key-manager/key-manager.module';

import { WalletActiveGuard } from './guards/wallet-active.guard';
import { WalletViewComponent } from './wallet-view/wallet-view.component';
import { WalletWidgetComponent } from './wallet-widget/wallet-widget.component';




export const walletRoutes: Routes = [
  { 
    path: '',
    component: WalletViewComponent,
    canActivate: [WalletActiveGuard],
    canDeactivate: [WalletActiveGuard],
  },
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BlockieModule,
    KeyManagerModule,
    FlexLayoutModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatMenuModule,
    MatCardModule,
    RouterModule.forChild(walletRoutes),
  ],
  declarations: [
    WalletViewComponent,
    WalletWidgetComponent,
  ],
  exports: [
    WalletWidgetComponent,
  ],
})
export class WalletModule {}
