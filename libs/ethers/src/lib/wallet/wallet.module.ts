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

import { BlockieModule, UploadModule } from '@blockframes/ui';
import { KeyManagerModule } from '../key-manager/key-manager.module';

import { WalletActiveGuard } from './guards/wallet-active.guard';
import { WalletViewComponent } from './wallet-view/wallet-view.component';
import { WalletImportKeyFromComponent } from './wallet-import-key-form/wallet-import-key-form.component';
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
    MatSlideToggleModule,
    UploadModule,
    RouterModule.forChild(walletRoutes),
  ],
  declarations: [
    WalletViewComponent,
    WalletImportKeyFromComponent,
    WalletWidgetComponent,
  ],
  exports: [
    WalletWidgetComponent,
  ],
})
export class WalletModule {}
