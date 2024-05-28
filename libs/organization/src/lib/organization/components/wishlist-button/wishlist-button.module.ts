import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistButtonComponent } from './wishlist-button.component';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';


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
