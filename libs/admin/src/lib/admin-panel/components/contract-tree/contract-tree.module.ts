import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';

// Components
import { ContractTreeComponent } from './contract-tree.component';

@NgModule({
  imports: [
    CommonModule,
    // Material
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule,
    MatTreeModule,
    MatButtonModule,
  ],
  declarations: [
    ContractTreeComponent,
  ],
  exports: [
    ContractTreeComponent
  ]
})
export class ContractTreeModule { }
