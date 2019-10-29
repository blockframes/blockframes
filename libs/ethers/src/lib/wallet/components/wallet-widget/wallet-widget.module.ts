import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletWidgetComponent } from './wallet-widget.component';

import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

const material = [MatMenuModule, MatIconModule];

@NgModule({
  imports: [CommonModule, ...material],
  declarations: [WalletWidgetComponent],
  exports: [WalletWidgetComponent],
})
export class WalletWidgetModule {}
