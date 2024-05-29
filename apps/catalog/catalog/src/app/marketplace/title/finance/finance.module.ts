import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketplaceMovieFinanceComponent } from './finance.component';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

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
