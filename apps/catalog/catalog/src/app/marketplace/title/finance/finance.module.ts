import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketplaceMovieFinanceComponent } from './finance.component';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [MarketplaceMovieFinanceComponent],
  imports: [
    CommonModule,
    ToLabelModule,
    // Material
    MatCardModule,
    RouterModule.forChild([{ path: '', component: MarketplaceMovieFinanceComponent }])
  ]
})
export class MarketplaceMovieFinanceModule { }
