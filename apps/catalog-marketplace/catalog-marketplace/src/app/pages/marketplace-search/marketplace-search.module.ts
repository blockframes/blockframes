// Pages
import { MarketplaceSearchComponent } from './marketplace-search.component';

// Libraries
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [MarketplaceSearchComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    
    // Material
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatButtonModule,

    RouterModule.forChild([
      {
        path: '',
        component: MarketplaceSearchComponent
      }
    ])
  ]
})
export class MarketplaceSearchModule {}
