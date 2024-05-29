import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarErrorComponent } from './snackbar-error.component';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [SnackbarErrorComponent],
  exports: [SnackbarErrorComponent],
  imports: [
    CommonModule,
    MatButtonModule
  ]
})
export class SnackbarErrorModule { }
