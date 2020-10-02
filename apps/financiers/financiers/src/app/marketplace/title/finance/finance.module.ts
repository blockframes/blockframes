import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketplaceMovieFinanceComponent } from './finance.component';
import { TranslateSlugModule, ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [MarketplaceMovieFinanceComponent],
  imports: [
    CommonModule,
    TranslateSlugModule,
    ToLabelModule,
    // Material
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: MarketplaceMovieFinanceComponent }])
  ]
})
export class MarketplaceMovieFinanceModule { }
