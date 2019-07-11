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

import { UploadModule } from '@blockframes/ui';
import { KeyManagerModule } from '../key-manager/key-manager.module';

import { WalletActiveGuard } from './guards/wallet-active.guard';
import { WalletKeyGuard } from './guards/wallet-key.guard';
import { WalletViewComponent } from './wallet-view/wallet-view.component';
import { WalletImportKeyFormComponent } from './wallet-import-key-form/wallet-import-key-form.component';
import { WalletWidgetComponent } from './wallet-widget/wallet-widget.component';
import { WalletAddKeyTunnelComponent } from './wallet-add-key/wallet-add-key.component';
import { WalletBlockieComponent } from './wallet-blockie/wallet-blockie.component';
import { WalletAddressViewComponent } from './wallet-address-view/wallet-address-view.component';


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
      { path: 'add', component: WalletAddKeyTunnelComponent },
      // { path: 'import', component: WalletAddKeyTunnelComponent }, // TODO issue 544
      // { path: 'send', component: WalletAddKeyTunnelComponent }, // TODO issue 542
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
  ],
  declarations: [
    WalletViewComponent,
    WalletImportKeyFormComponent,
    WalletWidgetComponent,
    WalletAddKeyTunnelComponent,
    WalletBlockieComponent,
    WalletAddressViewComponent
  ],
  exports: [
    WalletWidgetComponent,
  ],
})
export class WalletModule {}
