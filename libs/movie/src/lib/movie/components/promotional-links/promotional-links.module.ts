// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { PromotionalLinksComponent } from './promotional-links.component';

// Modules
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [PromotionalLinksComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    WishlistButtonModule,

    // Material
    MatIconModule,
    MatMenuModule
  ],
  exports: [PromotionalLinksComponent]
})
export class PromotionalLinksModule { }
