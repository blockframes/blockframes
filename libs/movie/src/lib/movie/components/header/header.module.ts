// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import {
  HeaderComponent,
  MovieHeaderPreferences,
  MovieHeaderCTA,
  MovieHeaderActions
} from './header.component';

// Blockframes
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { MovieTitleFeaturesModule } from '../title-features/title-features.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';


@NgModule({
  declarations: [
    HeaderComponent,
    MovieHeaderPreferences,
    MovieHeaderCTA,
    MovieHeaderActions
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    DisplayNameModule,
    ImageReferenceModule,
    MovieTitleFeaturesModule,
    ImageReferenceModule
  ],
  exports: [
    HeaderComponent,
    MovieHeaderPreferences,
    MovieHeaderCTA,
    MovieHeaderActions
  ]
})
export class MovieHeaderModule { }
