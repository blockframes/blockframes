import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarErrorComponent } from './snackbar-error.component';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [SnackbarErrorComponent],
  exports: [SnackbarErrorComponent],
  imports: [
    CommonModule,
    MatButtonModule
  ]
})
export class SnackbarErrorModule { }
