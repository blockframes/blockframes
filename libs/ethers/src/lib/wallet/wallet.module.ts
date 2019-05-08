import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AskPasswordComponent } from './ask-password/ask-password.component';
import { WalletRecoverComponent } from './recover/recover.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatInputModule,
  MatFormFieldModule,
  MatButtonModule,
  MatSnackBarModule,
  MatIconModule,
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  declarations: [AskPasswordComponent, WalletRecoverComponent],
  exports: [AskPasswordComponent, WalletRecoverComponent],
  entryComponents: [AskPasswordComponent, WalletRecoverComponent],
})
export class WalletModule {}
