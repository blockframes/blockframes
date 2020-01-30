import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MarketplaceMovieTechnicalInformationComponent } from './technical-information.component';

@NgModule({
  declarations: [MarketplaceMovieTechnicalInformationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: MarketplaceMovieTechnicalInformationComponent }])
  ]
})
export class MarketplaceMovieTechnicalInformationModule { }
