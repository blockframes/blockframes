import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MarketplaceMovieTechnicalInformation } from './technical-information.component';

@NgModule({
  declarations: [MarketplaceMovieTechnicalInformation],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: MarketplaceMovieTechnicalInformation }])
  ]
})
export class MarketplaceMovieTechnicalInformationModule { }
