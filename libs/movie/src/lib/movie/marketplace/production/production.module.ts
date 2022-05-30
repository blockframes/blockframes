import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductionComponent } from './production.component';

import { ShootingModule } from '../../pipes/shooting.pipe';
import { CreditCardModule } from '../../components/credit-card/credit-card.module';
import { HasKeysModule, DisplayNameModule, ToLabelModule } from '@blockframes/utils/pipes';

import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [ProductionComponent],
  imports: [
    CommonModule,
    CreditCardModule,
    ShootingModule,
    HasKeysModule,
    ToLabelModule,
    DisplayNameModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: ProductionComponent }])
  ]
})
export class MovieProductionModule { }
