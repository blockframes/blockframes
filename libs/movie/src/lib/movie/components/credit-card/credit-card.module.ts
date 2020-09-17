import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreditCardComponent } from './credit-card.component';

import { DisplayNameModule } from '@blockframes/utils/pipes';

import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [CreditCardComponent],
  exports: [CreditCardComponent],
  imports: [
    CommonModule,
    DisplayNameModule,
    MatTabsModule,
    MatIconModule,
  ]
})
export class CreditCardModule { }
