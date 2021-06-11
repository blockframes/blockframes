import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistButtonComponent, WishlistRemoveTextDirective, WishlistAddTextDirective } from './wishlist-button.component';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({
  declarations: [WishlistButtonComponent, WishlistRemoveTextDirective, WishlistAddTextDirective],
  exports: [WishlistButtonComponent, WishlistRemoveTextDirective, WishlistAddTextDirective],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ]
})
export class WishlistButtonModule { }
