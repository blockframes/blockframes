import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsComponent } from './icons.component';

import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRippleModule } from '@angular/material/core';
import { ClipboardModule } from '@angular/cdk/clipboard';


@NgModule({
  declarations: [IconsComponent],
  exports: [IconsComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatSnackBarModule,
    MatRippleModule,
    ClipboardModule,
  ]
})
export class IconsModule { }
