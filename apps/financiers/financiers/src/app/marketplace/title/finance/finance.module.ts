import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketplaceMovieFinanceComponent } from './finance.component';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.pipe';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [MarketplaceMovieFinanceComponent],
  imports: [
    CommonModule,
    TranslateSlugModule,
    // Material
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: MarketplaceMovieFinanceComponent }])
  ]
})
export class MarketplaceMovieFinanceModule { }
