import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';

import { UploadModule, UiFormModule, FeedbackMessageModule } from '@blockframes/ui';
import { KeyManagerModule } from '../key-manager/key-manager.module';

import { WalletActiveGuard } from './guards/wallet-active.guard';
import { WalletKeyGuard } from './guards/wallet-key.guard';
import { WalletViewComponent } from './pages/wallet-view/wallet-view.component';
import { WalletImportKeyFormComponent } from './components/wallet-import-key-form/wallet-import-key-form.component';
import { WalletAddKeyTunnelComponent } from './pages/wallet-add-key/wallet-add-key.component';
import { WalletSendTxTunnelComponent } from './pages/wallet-send-tx/wallet-send-tx.component';
import { WalletAskPasswordFormComponent } from './components/wallet-ask-password-form/wallet-ask-password-form.component';
import { WalletCreatePasswordFormComponent } from './components/wallet-create-password-form/wallet-create-password-form.component';
import { WalletBlockieComponent } from './components/wallet-blockie/wallet-blockie.component';
import { WalletAddressViewComponent } from './components/wallet-address-view/wallet-address-view.component';
import { WalletImportKeyComponent } from './components/wallet-import-key/wallet-import-key.component';
import { WalletNoKeyComponent } from './pages/wallet-no-key/wallet-no-key.component';
import { WalletRevealMnemonicComponent } from './pages/wallet-reveal-mnemonic/wallet-reveal-mnemonic.component';
import { WalletTxGuard } from './guards/wallet-tx.guard';
import { PicturesModule } from '@blockframes/ui';


export const walletRoutes: Routes = [
  {
    path: '',
    canActivate: [WalletActiveGuard],
    canDeactivate: [WalletActiveGuard],
    children: [
      {
        path: '',
        canActivate: [WalletKeyGuard],
        component: WalletViewComponent,
      },
      { path: 'no-key', component: WalletNoKeyComponent },
      { path: 'add', component: WalletAddKeyTunnelComponent },
      { path: 'import', component: WalletImportKeyComponent },
      {
        path: 'send',
        canActivate: [WalletKeyGuard, WalletTxGuard],
        component: WalletSendTxTunnelComponent
      },
      { path: 'reveal/:address', component: WalletRevealMnemonicComponent }
    ]
  },
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatSlideToggleModule,
    MatStepperModule,
    UploadModule,
    RouterModule.forChild(walletRoutes),
    UiFormModule,
    FeedbackMessageModule,
    MatDividerModule,
    PicturesModule
  ],
  declarations: [
    WalletViewComponent,
    WalletImportKeyFormComponent,
    WalletAddKeyTunnelComponent,
    WalletSendTxTunnelComponent,
    WalletAskPasswordFormComponent,
    WalletCreatePasswordFormComponent,
    WalletBlockieComponent,
    WalletAddressViewComponent,
    WalletImportKeyComponent,
    WalletNoKeyComponent,
    WalletRevealMnemonicComponent,
  ]
})
export class WalletModule {}
