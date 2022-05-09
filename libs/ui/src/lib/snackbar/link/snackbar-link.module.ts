import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarLinkComponent } from './snackbar-link.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [SnackbarLinkComponent],
  exports: [SnackbarLinkComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule,
    FlexLayoutModule
  ]
})
export class SnackbarLinkModule { }
