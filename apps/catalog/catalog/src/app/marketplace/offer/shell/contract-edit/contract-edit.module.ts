import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractEditComponent } from './contract-edit.component';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { NegotiationGuard } from '@blockframes/contract/negotiation/guard';
import { NegotiationFormModule } from '@blockframes/contract/negotiation';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    ContractEditComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatDialogModule,
    RouterModule.forChild([
      {
        path: '', component: ContractEditComponent,
        canActivate: [NegotiationGuard],
        canDeactivate: [NegotiationGuard],
      }
    ]),

    //Material imports
    NegotiationFormModule,
    MatButtonModule,
  ]
})
export class ContractEditModule { }
