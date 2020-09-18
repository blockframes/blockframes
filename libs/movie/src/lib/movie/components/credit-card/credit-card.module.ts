import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreditCardComponent } from './credit-card.component';

import { DisplayNameModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [CreditCardComponent],
  exports: [CreditCardComponent],
  imports: [
    CommonModule,
    DisplayNameModule,
    MaxLengthModule,
    FlexLayoutModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class CreditCardModule { }
