import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule, MatIconModule, MatSnackBarModule } from '@angular/material';
import { RouterModule } from '@angular/router';

// Components
import { ContractTreeComponent } from './contract-tree.component';

@NgModule({
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule,
  ],
  declarations: [
    ContractTreeComponent,
  ],
  exports: [
    ContractTreeComponent
  ]
})
export class ContractTreeModule { }
