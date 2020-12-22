import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketplaceInvestmentComponent } from './investment.component';

import { HasKeysModule } from '@blockframes/utils/pipes';
import { PerkCardModule } from '../../components/perk-card/perk-card.module';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';

import { MatDividerModule } from '@angular/material/divider';



@NgModule({
  declarations: [MarketplaceInvestmentComponent],
  imports: [
    CommonModule,
    HasKeysModule,
    PerkCardModule,
    MatLayoutModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: MarketplaceInvestmentComponent }])
  ]
})
export class MarketplaceInvestmentModule { }
