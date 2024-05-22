import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistButtonComponent } from './wishlist-button.component';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';


@NgModule({
  declarations: [WishlistButtonComponent],
  exports: [WishlistButtonComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ]
})
export class WishlistButtonModule { }
