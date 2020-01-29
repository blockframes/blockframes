import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MarketplaceMovieMainComponent } from './main.component';

@NgModule({
  declarations: [MarketplaceMovieMainComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: MarketplaceMovieMainComponent }])
  ]
})
export class MarketplaceMovieMainModule { }
