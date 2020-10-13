import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketplaceComponent } from './marketplace.component';

import { HasKeysModule } from '@blockframes/utils/pipes';
import { PerkCardModule } from '../components/perk-card/perk-card.module';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';

import { MatDividerModule } from '@angular/material/divider';



@NgModule({
  declarations: [MarketplaceComponent],
  imports: [
    CommonModule,
    HasKeysModule,
    PerkCardModule,
    MatLayoutModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: MarketplaceComponent }])
  ]
})
export class MarketplaceModule { }
