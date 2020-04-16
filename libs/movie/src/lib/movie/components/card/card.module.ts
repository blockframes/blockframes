import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card.component';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.module';
import { FeatureModule } from '@blockframes/utils/pipes/feature.module';
import { WishlistButtonModule } from "@blockframes/organization/organization/components/wishlist-button/wishlist-button.module";
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';

export const imports = [
  CommonModule,
  RouterModule,
  ImageReferenceModule,
  DisplayNameModule,
  WishlistButtonModule,
  FeatureModule,
  MatButtonModule,
  FlexLayoutModule
];

@NgModule({
  declarations: [CardComponent],
  exports: [CardComponent],
  imports
})
export class MovieCardModule { }
