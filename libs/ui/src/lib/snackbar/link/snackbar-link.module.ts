import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarLinkComponent } from './snackbar-link.component';
import { RouterModule } from '@angular/router';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [SnackbarLinkComponent],
  exports: [SnackbarLinkComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule,
  ]
})
export class SnackbarLinkModule { }
