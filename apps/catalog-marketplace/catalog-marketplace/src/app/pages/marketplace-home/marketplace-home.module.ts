// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Material
import { MatButtonModule } from '@angular/material/button';

// Libraries
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCarouselModule } from '@ngmodule/material-carousel';

// Pages
import { CatalogMarketplaceHomeComponent } from './marketplace-home.component';

@NgModule({
  declarations: [CatalogMarketplaceHomeComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    FlexLayoutModule,
    MatCarouselModule,
    RouterModule.forChild([
      {
        path: '',
        component: CatalogMarketplaceHomeComponent
      }
    ])
  ]
})
export class MarketplaceHomeModule {}
