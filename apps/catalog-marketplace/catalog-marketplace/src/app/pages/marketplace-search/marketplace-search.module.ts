// Pages
import { MarketplaceSearchComponent } from './marketplace-search.component';

// Libraries
import { FlexLayoutModule } from '@angular/flex-layout';

// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [MarketplaceSearchComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule.forChild([
      {
        path: '',
        component: MarketplaceSearchComponent
      }
    ])
  ]
})
export class MarketplaceSearchModule {}
