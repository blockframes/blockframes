import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MarketplaceMovieAvailsComponent } from './avails.component';

@NgModule({
  declarations: [MarketplaceMovieAvailsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: MarketplaceMovieAvailsComponent }])
  ]
})
export class MarketplaceMovieAvailsModule { }
