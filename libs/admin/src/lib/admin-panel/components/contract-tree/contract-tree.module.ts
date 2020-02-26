import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule, MatIconModule, MatSnackBarModule, MatTreeModule, MatButtonModule } from '@angular/material';
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
