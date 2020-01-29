import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MarketplaceMovieMediaComponent } from './media.component';

@NgModule({
  declarations: [MarketplaceMovieMediaComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: MarketplaceMovieMediaComponent }])
  ]
})
export class MarketplaceMovieMediaModule { }
